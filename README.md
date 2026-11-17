# DARTS Automation Playwright

DARTS automation written using Playwright with TypeScript.

This framework supersedes the old Selenium/Java framework as of 21/02/2025.
Old framework to be archived: https://github.com/hmcts/darts-automation

To use this repo you will need Node.js 20 or 22 and the Yarn version pinned in
`package.json` (currently Yarn 4.18.0). Use `.nvmrc` for the recommended Node version.

I recommend using a version manager such as [NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) to manage node.js versions.

```
# using nvm
nvm install
nvm use
# check node version
node -v
```

To install `yarn`

```
# using corepack
corepack enable
# Corepack selects the Yarn version pinned in package.json
yarn install
# check yarn version
yarn --version
```

## Developing and running tests locally

### Standalone Playwright tests

Run `yarn test:e2e` to execute the tests in `e2e/tests` using
`e2e/playwright.config.ts`. The suite runs tests in parallel with two workers,
including tests in the same file. The case-search example creates a unique case and
actual hearing through the API, finds the case in the UI and checks its details.
The transcript-request example also uploads its own sample audio and submits a
Court Log transcript request through the UI. The remaining `test2` placeholder
signs in and prints the page title.

Install Chromium with `yarn playwright install chromium`. Set these variables in
your shell or through Jenkins secret injection before running the suite:

| Variable              | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `DARTS_PORTAL`        | Target portal origin, without `/login`                               |
| `AUTOMATION_USERNAME` | Username for the selected login route                                |
| `AUTOMATION_PASSWORD` | Password, supplied through approved secret loading                   |
| `E2E_LOGIN_ROUTE`     | `internal` for Microsoft employee login, or `external` (the default) |

For an internal account, set `export E2E_LOGIN_ROUTE=internal`, then run
`yarn test:e2e`. Account permissions such as superuser do not select the login
route. The target must be reachable; VPN access may be required. Jenkins currently
supplies credentials for its existing login flow; internal login needs the corresponding account credentials.

A setup project logs in once per invocation (once in each shard), with tracing,
screenshots and video disabled. It saves the session under the Git-ignored
`e2e/test-results/.auth` directory with owner-only file permissions. Each test gets
a fresh Playwright-managed context using that session. Browser isolation does not
isolate server-side account data. Credential entry is excluded from traces.
Security-registration and additional-verification prompts fail with a clear message;
the helper does not complete those interactive steps.

Pass Playwright options directly, for example `yarn test:e2e --list` or
`yarn test:e2e --grep "case created through the API"`. Results are written to `e2e/test-results`, and
browser tests retain traces on failure. Traces can contain authenticated application
data and should be handled accordingly.

Run `yarn test:e2e:auth-checks` to check the login helper against synthetic local
identity pages. These checks use fake credentials and require no Azure access or
live DARTS environment.

The business specs use small page objects in `e2e/pages`, supplied by typed fixtures
as `caseSearch`, `casePage`, `hearingPage` and `transcriptRequest`. The specs describe
the journey and its expected outcomes; page objects own locators, form interactions,
navigation and page-specific checks. API clients and test-data setup remain in
`e2e/api` and the data fixtures, separate from the page objects.

### API setup for standalone Playwright tests

Import `test` and `expect` from `e2e/fixtures.ts` in tests that need API data setup.
Request the `api` fixture alongside a page-object fixture to use both services in one test:

```ts
import { test, expect } from '../fixtures';

test('example using the API and UI', async ({ api, caseSearch }) => {
  const response = await api.get('/courthouses');
  expect(response.status).toBe(200);
  await caseSearch.open();
});
```

The fixture authenticates only when requested. It obtains a fresh B2C functional-test
token for each test, separate from the UI session. Its `get(path)` and `post(path, body)`
methods return standard HTTP `Response` objects; check `response.status` and use
`await response.json()` to read the payload. Credentials, token responses and bearer
headers use Node's HTTP client, keeping them outside Playwright traces. Network calls
have a 30-second timeout, reject redirects, and send the bearer token only to the
configured API origin. Use `test.step` to describe setup operations in reports.

Supply these environment variables directly or through approved secret loading:

| Variable                                   | Staging Key Vault secret               |
| ------------------------------------------ | -------------------------------------- |
| `DARTS_API`                                | Explicit HTTPS API origin; no default  |
| `AAD_B2C_ROPC_CLIENT_ID`                   | `AzureAdB2CFuncTestROPCClientId`       |
| `AAD_B2C_ROPC_CLIENT_SECRET`               | `AzureAdB2CFuncTestROPCClientSecret`   |
| `AZURE_AD_FUNCTIONAL_TEST_GLOBAL_USERNAME` | `AzureAdB2CFuncTestROPCGlobalUsername` |
| `AZURE_AD_FUNCTIONAL_TEST_GLOBAL_PASSWORD` | `AzureAdB2CFuncTestROPCGlobalPassword` |

This authentication uses the existing staging B2C functional-test policy. For an
API-owned PR portal, `DARTS_API` must identify the same PR. UI-only tests do not need
API credentials. The API readiness check does not create records.

To verify authentication and read courthouse reference data without browser login:

```sh
export DARTS_API='https://darts-api-pr-<PR-number>.dev.platform.hmcts.net'
yarn test:e2e:api-check:stg
```

The `:stg` helper requires Azure CLI, an authenticated Azure session with access to
`darts-stg`, and network access to the API. It loads only missing API credentials into
the child process; it does not print them or write a credentials file. If credentials
are already supplied, use `yarn test:e2e:api-check` directly. No env file is loaded.

The API branch's `bin/ci/playwright-e2e.groovy` supplies the matching API origin and
the four API secrets to each shard through the existing Jenkins Key Vault integration.
It also supplies `E2E_AUDIO_INBOUND_SAS_URL` for the transcript-request example.
The separate API check is a readiness tool and is not added to the two-test UI demo.

Run `yarn test:e2e:api-unit` for local synthetic HTTP/configuration checks and
`yarn typecheck:e2e` for TypeScript validation. Neither command needs credentials.

### Create a case through the API and find it in the UI

`e2e/tests/case-search.spec.ts` replaces the first login-only placeholder. Its
test-scoped `caseWithInterpreter` fixture creates one unique `PW-*` case, posts a `1100`
hearing-start event and records an interpreter-sworn event (`20917`). The configured
automation account has `TRANSLATION_QA`, which limits its searches to interpreter-used
cases. Portal search also requires an actual hearing. The test checks the
case ID, courthouse, courtroom and defendant in the results, then opens the result
and verifies its URL contains the case ID returned by the API.

Run it against an API-owned PR environment with staging Key Vault credentials:

```sh
export DARTS_PORTAL='https://darts-portal-api-pr-<PR-number>.dev.platform.hmcts.net'
export DARTS_API='https://darts-api-pr-<PR-number>.dev.platform.hmcts.net'
yarn test:e2e:case-search:stg
```

This command loads missing API credentials and the external automation credentials
(`AutomationTestUserName` / `AutomationTestPassword`) from `darts-stg` into the test process. It saves an HTML report under a unique
`playwright-report/case-search-*` directory and retains each run's artifacts under
`e2e/test-results/runs`. With credentials already supplied, run
`yarn test:e2e e2e/tests/case-search.spec.ts` instead. The test needs the API account
to have the global `MID_TIER` and `CPP` or `XHIBIT` roles, and the UI account to have
access to the selected courthouse.

Reference data defaults to `HARROW CROWN COURT`; override this with
`E2E_DATA_COURTHOUSE` (API courthouse name). The courthouse must already exist;
its display name is read from the API. Each test creates a unique `PW-*` courtroom
to prevent audio/event linking between different test cases or runs.

Case creation currently requires matching API-owned dev PR URLs. Each run/retry
uses a new case number and message ID. Synthetic case/hearing/event records are
retained in that PR database because no scoped cleanup endpoint is available.
Identifiers are attached to the report before the first write, including partial
setup failures. The test never calls `/functional-tests/clean`, which can delete
other runs' data. Scoped teardown remains a follow-up before treating this as a
fully repeatable suite with no data accumulation.

### Submit a transcript request for a hearing with audio

`e2e/tests/transcript-request.spec.ts` covers the request-submission part of
`DARTS_Request_Transcript.feature`, scenario "Request Transcription, Court Log by
Manually Entering Time". It uses the configured external automation account; the
Cucumber scenario uses a requester and continues into approval and delivery.

The test creates its own case and hearing, uploads a fresh copy of
`src/testdata/sample1.mp2` under a new blob UUID, and registers the actual file size,
MD5 checksum and hearing association through `/audios/metadata`. It polls the
hearing audio metadata with a bounded timeout. The UI selects Court Log, Overnight,
and the sample's one-minute interval, submits the request, verifies the returned
request ID, and checks the hearing lists it as Awaiting Authorisation.

Supply `E2E_AUDIO_INBOUND_SAS_URL` for the inbound container used by the target API.
Alternatively, the local Key Vault helper can load `DartsInboundStorageSasUrl` from
the explicitly selected `E2E_AUDIO_STORAGE_VAULT`. Storage credentials are separate
from identity credentials: changing `DARTS_API` does not retarget storage.
Audio registration against PR 3503 was verified using the inbound SAS from `darts-stg`.

```sh
export DARTS_PORTAL='https://darts-portal-api-pr-<PR-number>.dev.platform.hmcts.net'
export DARTS_API='https://darts-api-pr-<PR-number>.dev.platform.hmcts.net'
export E2E_AUDIO_STORAGE_VAULT='<vault-used-by-the-target-API-storage>'
yarn test:e2e:transcript-request:stg
```

Run `yarn test:e2e:examples:stg --workers=2` with those settings to run both business
examples in parallel. The original `test2` placeholder is left in place and excluded
from this convenience command. Both commands keep a separate HTML report and
artifacts directory per invocation.

Latest local verification against PR 3503 on 17 November 2026: both page-object-based
examples passed with the standard external automation account
(`AutomationTestUserName` / `AutomationTestPassword`) and two workers in 19.0 seconds,
including login and excluding Key Vault loading. Case search and transcript request
took 8.4 and 11.4 seconds respectively. The JSON report records the timings.
Case search uses an interpreter-used case to satisfy this account's `TRANSLATION_QA`
search restriction; no account permissions were changed.

The upload uses HTTPS, a unique blob name and a create-only condition. SAS URLs are
never logged or attached to reports. Audio metadata must be linked to the hearing;
playback conversion and transcript fulfilment are outside this test's scope, so
they do not require a background audio worker for this example. Blob, media and
transcript IDs are retained as report attachments. Targeted teardown is deferred;
the test does not delete existing data or invoke shared bulk cleanup.

### Parallel workers and sharding

`--workers=2` runs tests concurrently within one Playwright invocation. Sharding
splits the suite between independent invocations using `--shard=1/2` and
`--shard=2/2`; each shard performs its own authentication setup.

The API branch's `bin/ci/playwright-e2e.groovy` already runs two shards on separate
Jenkins agents, checks out the same Playwright commit on both, and merges their blob
reports into HTML/JSON results. Its runner executes the full `e2e/tests` directory,
including the remaining `test2` placeholder. The local examples command selects
only the two business tests.

Check how those two examples are distributed without credentials or creating data:

```sh
yarn test:e2e e2e/tests/case-search.spec.ts e2e/tests/transcript-request.spec.ts --list --shard=1/2
yarn test:e2e e2e/tests/case-search.spec.ts e2e/tests/transcript-request.spec.ts --list --shard=2/2
```

The current examples have passed locally with two workers. A live run of these
examples across two independent shards, merged-report verification, and execution
of the updated tests through Jenkins remain outstanding. Parallel-worker results
alone do not establish that the updated sharded CI path works.

### Prereqs

To develop tests locally, first you need to ensure the following

- you are connected to [HMCTS VPN](https://portal.platform.hmcts.net/)
- you have the Azure CLI and `jq` installed
  - [install Azure CLI with homebrew](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-macos#install-with-homebrew)
  - `brew install jq`
- you have set the required secrets in your terminal by running `source ./bin/secrets-stg.sh`
- run `yarn install`

### Commands

After that there are various `yarn` commands and combinations that can be used to run the tests.

- `yarn test <options>` - headless browser, no debugging
- `yarn browser <options>` - same as yarn test, but shows the browser
- `yarn debug <options>` - runs playwright debugging, allowing you to step through the code
- `yarn video <options>` - same as yarn test with video recoding of the tests

You can set the `<options>` for the command depending on what you want to run.

- `features/portal/DARTS_Portal.feature` - specify single feature file
- `features/portal/*.feature` - specify multiple feature files using wildcards
- `-- --tags @smoketest` - specify a tag to run, uses [Cucumber Tag expressions](https://cucumber.io/docs/cucumber/api/#tag-expressions)

Note, that Cucumber is configured with the following tag expression by default, meaning that no features/scenarios with those tags will be run.

```
(not @broken and not @obsolete and not @TODO and not @review)
```

## Debugging Features

There are various way to debug features, firstly using the `yarn debug` command above which will enable you to step through the code and see what playwright is doing within the browser.

### Traces

Playwright can record and view traces and includes a [Trace viewer](https://playwright.dev/docs/trace-viewer) tool.

Traces are automatically recorded for all scenarios which failed and the generated ZIP files can be found in the `traces` directory.

You can view a trace (ZIP) in the Trace viewer using the following command, which shows every step through the tests and the locators/actions used.

```
yarn playwright show-trace traces/<trace_name>.zip
```

Note: the `traces` directory can safely be deleted and it will be re-created when the next trace is generated.

### Generating locators

[Locators](https://playwright.dev/docs/locators) represent a way to find an element on the page and are a Playwright fundamental.

If you would like to generate locators you can do so by [running Codegen](https://playwright.dev/docs/codegen#running-codegen), which brings up the playwright debugger and lets you browse any website and generate locators for use in tests.

### Database

Some steps run queries against the staging database, these can be debugged by setting the `DEBUG_DATABASE` environment variable to `true`, for example. This will output to the console showing the queries and inputs.

```
DEBUG_DATABASE=true yarn test -- --tags @tag-with-db-steps
```

### Jenkins

If tests fail on Jenkins runs then traces and videos will be recorded and saved as artifacts on the build. Generally, I would recommend the following when assessing a failing test.

1. Check the "Cucumber Test Report" for the build, filtering to failed.
1. See the step that failed and determine if it could have been related to a known issue.
1. If the failure is within a portal/admin portal feature:
   1. Download the trace ZIP and use the Trace viewer to assess the failure.
1. If the failure is a SOAP/JSON API step:
   1. View the console log to see the error.
   1. Crosscheck app insights for staging for any related errors.
1. Run the feature locally, if it passes then it could be some flakiness on Jenkins, this is expected to some degree.
   1. Assess if the flakiness could be improved.
1. If the feature fails locally, make any changes required to fix it and create a PR.
1. Once the PR is merged run the tests on Jenkins and cross your fingers.

## Which tests run when

[Nightly](https://sds-build.hmcts.net/job/HMCTS_Nightly/job/darts-automation-playwright/job/master/)

- configured by `Jenkinsfile_nightly`
- `@smoketest`, `@regression` and `@end2end` tags are run
- daily first thing in the morning
- tests against the staging environments
- can be triggered to run anytime within Jenkins

[PR / master branch](https://sds-build.hmcts.net/job/HMCTS/job/darts-automation-playwright/job/master/)

- configured by `Jenkinsfile_CNP`
- `@smoketest` tag is run
- tests against the staging environments
- can be triggered to run anytime within Jenkins

### INCLUDE_TAGS parameter

To run the build with specific tags, choose the "Build with parameters" option and specify the tag expression to use.

## Browser selection

By default we will use chromium. You can define an environment variable called BROWSER and
set the name of the browser. Available options: chromium, firefox, webkit

On Linux and Mac you can write:

`BROWSER=firefox yarn test` runs all tests using Firefox

On Windows you need to write (this is untested)

```
set BROWSER=firefox
yarn test
```
