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
Court Log transcript request through the UI.

See [the E2E testing approach and journey guide](e2e/doc/README.md) for
folder responsibilities, named-user setup, journey coverage and a
recipe for adding future tests.

Local logging defaults to `INFO`. For detailed output, set `metadata.logLevel` to
`DEBUG` in `e2e/playwright.config.ts`; this also applies to the Playwright run button.
See the E2E guide for logged events and diagnostics guidance.

Each scenario has a unique business-area ID, such as `CS_001` for case search or
`TR_001` for transcript submission. Use it in the test title and lowercase filename;
use the same ID in the Scenario description, for example
`Scenario: CS_001: The Requester can find a case and open its hearing.` Allocate IDs within each area without
renumbering existing tests. See the E2E guide for the prefix and folder conventions.

Install Chromium with `yarn playwright install chromium`. Copy `e2e/.env.example`
to `e2e/.env` and uncomment and fill in the values needed for your tests, or set
them in your shell or through Jenkins secret injection. The Playwright configuration
loads `e2e/.env` regardless of the working directory; existing environment variables
take precedence. The file is Git-ignored: keep credentials out of the example and
never commit or share the populated file. The file is optional when using injected
variables.

Both business specs select the existing external automation account through the
`authUser` fixture option. Supply `AUTOMATION_USERNAME` and `AUTOMATION_PASSWORD`
through environment injection or the ignored `e2e/.env` file. Other named account
profiles remain available in the guide.

The generic automation profile supports these existing variables:

| Variable              | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `DARTS_PORTAL`        | Target portal origin, without `/login`                               |
| `AUTOMATION_USERNAME` | Username for the selected login route                                |
| `AUTOMATION_PASSWORD` | Password, supplied through approved secret loading                   |
| `E2E_LOGIN_ROUTE`     | `internal` for Microsoft employee login, or `external` (the default) |

Named accounts choose their own identity provider. `E2E_LOGIN_ROUTE` only affects
specs that explicitly select the generic automation profile. The target must be
reachable; VPN access may be required.

The authentication fixture logs in once per worker and selected user. Credential
entry runs in a separate process without Playwright Test recording. It saves the
session under Git-ignored `e2e/.auth` with owner-only file permissions and deletes
the worker-owned state file on normal teardown. Files left by interrupted runs
must be treated as credentials. Each test gets
a fresh Playwright-managed context using that session. Browser isolation does not
isolate server-side account data. Credential entry is excluded from traces.
Security-registration and additional-verification prompts fail with a clear message;
the helper does not complete those interactive steps.

Pass Playwright options directly, for example `yarn test:e2e --list` or
`yarn test:e2e --grep "find a case and open its hearing"`. Results are written to `e2e/test-results`, and
browser tests retain traces on failure. Traces can contain authenticated application
data and should be handled accordingly.

The business specs use small page objects in `e2e/pages`, supplied by typed fixtures
as `caseSearch`, `casePage`, `hearingPage` and `transcriptRequest`. The specs describe
the journey and its expected outcomes; page objects own locators, form interactions,
navigation and page-specific checks. API clients and test-data setup remain in
`e2e/services`, `e2e/data` and `e2e/fixtures`, separate from the page objects.

### API setup for standalone Playwright tests

Import `test` and `expect` from `e2e/fixtures/test.ts` for UI journeys. Choose
an account explicitly with `test.use({ authUser: AuthUser.AUTOMATION })` or another
named account from `e2e/setup/users.ts`. Both examples use the existing automation
account for Requester actions; this does not prove least-privilege Requester access.

Keep API calls and response validation inside setup fixtures and services. Business
specs contain UI actions and assertions. Background and Given / When / Then
statements describe business context and outcomes; keep preparation mechanisms in
the technical setup documentation. See the guide for the complete UI-only AAA example.

The `cases`, `courthouses` and `audio` fixtures expose domain operations. Their
shared transport authenticates lazily with a fresh B2C functional-test token for
each test, separate from the selected UI user. Credentials, token responses and
bearer headers use Node fetch, keeping them outside Playwright traces. Network
calls have a 30-second timeout, reject redirects, and send the bearer token only
to the configured API origin. Use Arrange / Act / Assert in the business specs.

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
API credentials.

Supply credentials through the environment or ignored `e2e/.env` file before
running `yarn test:e2e`. The suite does not load credentials directly from Key Vault.
Select the target explicitly with matching `DARTS_PORTAL` and `DARTS_API` values.

The updated `darts-api/bin/ci/playwright-e2e.groovy` runner supplies matching PR
portal/API URLs and injects the browser credentials, four API credentials and
inbound audio SAS explicitly for each shard. Its shell runner validates required
variables and targets before starting Node or browsers. See the guide's CI
integration section for labels and the remaining Jenkins verification.
Run `yarn typecheck:e2e` and `yarn lint` for static validation. The E2E suite contains
only the two business journey specs; there are no framework/helper test suites.

### Create a case through the API and find it in the UI

`e2e/tests/cases/cs_001-find-case-and-hearing.spec.ts` replaces the first login-only placeholder. Its
test-scoped `caseWithInterpreter` fixture creates one unique `PW-*` case, posts a
`1100` hearing-start event and records interpreter use. Portal search requires an
actual hearing; the automation account's Translation QA role also requires interpreter use. The test checks the
case ID, courthouse, courtroom and defendant in the results, then opens the result
and verifies its URL contains the case ID returned by the API. It then opens the
API-created hearing and verifies its courthouse, courtroom and hearing-start event.

With the required credentials supplied, run against an API-owned PR environment:

```sh
export DARTS_PORTAL='https://darts-portal-api-pr-<PR-number>.dev.platform.hmcts.net'
export DARTS_API='https://darts-api-pr-<PR-number>.dev.platform.hmcts.net'
yarn test:e2e e2e/tests/cases/cs_001-find-case-and-hearing.spec.ts
```

The test needs the API account to have the global `MID_TIER` and `CPP` or `XHIBIT`
roles, and the UI account to have access to the selected courthouse. Results use the
configured `e2e/test-results` directory.

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

`e2e/tests/transcripts/tr_001-submit-transcript-request.spec.ts` covers the request-submission part of
`DARTS_Request_Transcript.feature`, scenario "Request Transcription, Court Log by
Manually Entering Time". It uses the existing automation account for Requester actions; the Cucumber scenario
continues into approval and delivery.

The test creates its own case and hearing, uploads a fresh copy of
`src/testdata/sample1.mp2` under a new blob UUID, and registers the actual file size,
MD5 checksum and hearing association through `/audios/metadata`. It polls the
hearing audio metadata with a bounded timeout. The UI selects Court Log, Overnight,
and the sample's one-minute interval, submits the request, verifies the returned
request ID, and checks the hearing lists it as Awaiting Authorisation.

Supply `E2E_AUDIO_INBOUND_SAS_URL` through the environment or `e2e/.env` for the
inbound container used by the target API. Storage credentials are separate from
identity credentials: changing `DARTS_API` does not retarget storage.

```sh
export DARTS_PORTAL='https://darts-portal-api-pr-<PR-number>.dev.platform.hmcts.net'
export DARTS_API='https://darts-api-pr-<PR-number>.dev.platform.hmcts.net'
# Supply the browser/API credentials and E2E_AUDIO_INBOUND_SAS_URL securely first.
yarn test:e2e e2e/tests/transcripts/tr_001-submit-transcript-request.spec.ts
```

Run `yarn test:e2e --workers=2` with those settings to run both business scenarios
in parallel. Use Playwright's `--reporter` and `--output` options if another report
format or artifacts directory is needed.

Historical verification before the folder/authentication refactor, against PR 3503 on 17 November 2026: both page-object-based
examples passed with the standard external automation account
(`AutomationTestUserName` / `AutomationTestPassword`) and two workers in 19.0 seconds,
including login and excluding Key Vault loading. Case search and transcript request
took 8.4 and 11.4 seconds respectively. The JSON report records the timings.
That earlier case-search version used an interpreter-used case to satisfy the account's `TRANSLATION_QA`
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
`--shard=2/2`; each shard creates its own worker/user authentication state.

The API branch's `bin/ci/playwright-e2e.groovy` already runs two shards on separate
Jenkins agents, checks out the same Playwright commit on both, and merges their blob
reports into HTML/JSON results. Its runner executes the full `e2e/tests` directory.
The local examples command selects the two business tests. That external runner
has not been verified as part of the folder/authentication refactor.

Check how those two examples are distributed without credentials or creating data:

```sh
yarn test:e2e e2e/tests/cases/cs_001-find-case-and-hearing.spec.ts e2e/tests/transcripts/tr_001-submit-transcript-request.spec.ts --list --shard=1/2
yarn test:e2e e2e/tests/cases/cs_001-find-case-and-hearing.spec.ts e2e/tests/transcripts/tr_001-submit-transcript-request.spec.ts --list --shard=2/2
```

Fresh-auth verification on 17 November 2026 against PR 3503: both current scenarios
passed with the existing automation account and two workers in 26.5 seconds.
`CS_001` took 11.6 seconds and `TR_001` took 14.9 seconds. Each worker signed in
from an empty browser context; its temporary storage-state file was removed on
teardown. Case setup creates the actual hearing before reading case details.

A live run across two independent shards, merged-report verification, and execution
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
