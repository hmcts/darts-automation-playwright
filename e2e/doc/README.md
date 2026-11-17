# DARTS Playwright approach and journey coverage

Reviewed 17 November 2026. This guide describes the standalone Playwright suite;
`features/` and `src/` remain the existing Cucumber suite.

## Testing approach

Typed fixtures provide authentication, services, pages and test-owned data. Each
spec names the user for its journey, and each test receives an isolated browser
context. Focused services prepare and retrieve data through DARTS APIs; page
objects perform UI actions and assertions.

Both business examples run with two workers against separate unique cases and
courtrooms. Fresh contexts isolate cookies and local storage; they do not isolate
server-side account state. Review account usage before adding journeys that edit
shared users, allocate shared tasks or sign out another active session.

Authentication is reused within each worker for its selected user. Storage files
are unique to a worker/run and removed on normal teardown; sessions are not reused
across separate runs. The tests remain independent and can run on separate shards.

## Folder responsibilities

```text
e2e/
  setup/       named users, login flow, auth capture/runner, API settings
  support/     shared logging and future diagnostics
  fixtures/    authentication, services, pages and test-scoped data lifecycles
  data/        typed case/audio models and pure unique-data builders
  services/    case, courthouse and audio operations; shared authenticated transport
  pages/       source-verified locators, UI interactions and page assertions
  flows/       reusable UI journeys and checks between screens
  tests/       business-area folders containing scenario-ID-prefixed specs
  doc/         source journey PDF and this guide
  .auth/       ignored, temporary credential-bearing storage states
```

`fixtures/test.ts` composes auth and service fixtures and provides page/data fixtures.
`fixtures/services.fixture.ts` supplies the domain services used during journey setup.
`services/darts-api-client.ts` is transport infrastructure, not the business API
that new journey specs should grow around. For example, use `cases.create(data)`,
`cases.get(id)`, `cases.getHearingId(case)` and `courthouses.get(name)`. Add a focused
service for a new domain rather than adding unrelated operations to one client.
The audio service uploads sample bytes and registers/polls their metadata.

## Selecting a user and reusing authentication

Both current specs explicitly select `AuthUser.AUTOMATION`, also the default in
`playwright.config.ts` and the authentication fixture. They exercise Requester
behaviour using the existing external automation account, whose broader roles
include Translation QA. These runs do not establish least-privilege Requester
coverage. The account must have access to the selected courthouse.
```ts
import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.AUTOMATION });
// A future approval spec selects AuthUser.APPROVER in its own spec file.
```

`playwright.config.ts` defines the default typed option. A spec's `test.use`
selects the actual named user; declare this worker option at file scope,
not inside a test body or nested describe. Both current tests can use the same account because they
perform Requester actions against separate test-owned cases. Transcript approval
must use a different person from the requester.

| User | Username variable | Password variable | Provider |
| --- | --- | --- | --- |
| `AUTOMATION` | `AUTOMATION_USERNAME` | `AUTOMATION_PASSWORD` | External by default; existing `E2E_LOGIN_ROUTE` override supported |
| `REQUESTER` | `AUTOMATION_REQUESTER_USERNAME` | `AUTOMATION_INTERNAL_PASSWORD` | Internal Microsoft |
| `APPROVER` | `AUTOMATION_APPROVER_USERNAME` | `AUTOMATION_INTERNAL_PASSWORD` | Internal Microsoft |
| `TRANSCRIBER` | `AUTOMATION_TRANSCRIBER_USERNAME` | `AUTOMATION_EXTERNAL_PASSWORD` | External B2C |

These variable names follow the existing DARTS secret injection conventions. The
selected account must exist, have the required role and courthouse access, and
support unattended login. No credentials are committed. Supply the selected
profile's variables through environment injection or copy the commented
`.env.example` to the ignored `.env` for local runs. Then run `yarn test:e2e`.
The suite does not fetch secrets directly from Key Vault.

Authentication is a worker fixture, not a setup dependency project. This lets a
spec select its user without maintaining a second user-to-spec map in config.
The fixture delegates credential entry to `setup/auth-runner.ts` in a separate
Node process, using `setup/auth.setup.ts` and the common login helper. That process
has no Playwright Test artifact recorder. Credential-entry parameters therefore
stay outside business-test traces. Do not move password entry into a traced test
page or log child-process errors containing request details.

After sign-in, setup writes an owner-only storage-state file. The fixture supplies
that path to Playwright's built-in `storageState`; Playwright creates and closes
the test context. State is reused once per worker/user, not once across all
workers. Workers, shards, retries with replacement workers, and independent runs
have unique files. The case-search spec uses `caseWithInterpreter` to satisfy the automation
account's Translation QA search restriction. Normal teardown deletes the worker's state file; interrupted
runs may leave files in `.auth/`, which must be handled as credentials. Do not
archive `.auth/`. Browser traces still contain authenticated application data.

## Mapping the two tests to the source journeys

Source: [DARTS user journeys v0.2](darts-user-journeys-v0.2.pdf), discussion draft
revised 6 November 2026. Its actors are representative and courthouse access is
assumed. It describes Crown/Magistrates service journeys, not detailed executable
test cases. These examples use Crown data and MP2 audio; they do not establish
Magistrates-specific coverage.

| Spec | Journey | API/storage preparation | UI behaviour asserted | Remaining journey scope |
| --- | --- | --- | --- | --- |
| `tests/cases/cs_001-find-case-and-hearing.spec.ts` | **Find a case and hearing**, PDF page 1; Requester actions using the automation account | Read courthouse; create unique case; read it back; post hearing-start event; get hearing ID. Record interpreter use to satisfy the automation account's search restriction. | Search exact case ID; verify case ID, courthouse, courtroom and defendant in the same result; open the API-created case; open the hearing; verify its ID, courthouse, courtroom and hearing-start event. | Reporting restrictions, additional judiciary details, advanced/partial search, alternative roles, and Magistrates search variants. |
| `tests/transcripts/tr_001-submit-transcript-request.spec.ts` | **Request and receive a transcript**, submission segment, PDF page 2; Requester actions using the automation account | Independently create/read case and hearing; upload unique sample audio blob; register metadata; wait for its hearing link. | Open hearing; start transcript request; select Court Log / Overnight and the seeded interval; check summary; submit via UI; verify returned request ID, confirmation and Awaiting Authorisation row on the correct hearing. | Approval by a different person; transcript production/upload; requester download and notifications. Unfulfilled and rejected requests are separate alternatives. |

The API preparation uses existing case/event/audio endpoints. It does not test the
whole SF01 Daily List intake, SF02 Magistrates recording discovery, SF03 matching
rules, or SF08 events lifecycle. A linked recording is a precondition here; it is
not evidence of end-to-end CVP/CAR ingestion or playback processing. Hearing audio playback and transcriber audio retrieval remain
separate journeys. 

The two specs remain independent: transcript submission does not consume the
case-search test's data or wait for that test to pass. Assertions about the user
journey stay in the browser; API setup must not submit the transcript request on
behalf of this UI test.

## Portal and API evidence

Reviewed against local `darts-portal` and `darts-api` working trees. Recheck these
sources when the application changes; no changes were made to those repos.

| Concern | Source in the application repos | Locator or contract used |
| --- | --- | --- |
| Case search | Portal `src/app/portal/components/search/case-search-form/case-search-form.component.html` and `case-search-results/case-search-results.component.html` | `#case_number`, `#search-results`; matching row scoped by exact case link |
| Hearing selection | Portal `src/app/portal/components/case/case-file/case-hearings-table/case-hearings-table.component.html` | `#hearingsTable`, accessible table caption and unique courtroom row |
| Hearing details/events | Portal `src/app/portal/components/hearing/hearing-file/hearing-file.component.html` and `events-and-audio/events-and-audio.component.html` | `app-hearing-file`, `#eventAudioTable` |
| Transcript form | Portal `src/app/portal/components/hearing/request-transcript/` templates | `#transcription-type`, `#urgency`, visible first-step `#audio-table`; time inputs `#start-hour-input` / minutes / seconds and equivalent end IDs |
| Confirmation | Portal `request-transcript/request-transcript-confirmation/request-transcript-confirmation.component.html` and success template | `#more-detail`, `#authorisation`; accessible summary definitions, submit button and confirmation heading |
| Hearing transcripts | Portal `src/app/portal/components/hearing/hearing.component.html` | `#transcriptsTable`, exact type/status cells; request permission includes Requester and several broader roles |
| Case create/get/hearings | API `src/main/resources/openapi/cases.yaml` | `POST /cases/addCase` returns 201; `GET /cases/{id}` and `/cases/{id}/hearings` return 200 |
| Reference data/events/audio | API `src/main/resources/openapi/courthouse.yaml`, `event.yaml`, `audio.yaml` | `GET /courthouses`; `POST /events`; `POST /audios/metadata`; `GET /audio/hearings/{id}/audios` |
| Transcript submit | API `src/main/resources/openapi/transcriptions.yaml`; portal transcription service | Browser posts `/api/transcriptions`; successful body includes `transcription_id` |

Use framework-neutral **`data-testid`** attributes for dedicated test hooks.
Playwright's default `getByTestId` targets that attribute without a config override.
Only use values verified in the portal templates; these two tests use existing
HTML IDs and accessible roles/labels. New test hooks should describe the element's
purpose without naming an automation framework. Scope repeated tables,
rows and time controls to avoid matching hidden later steps. The transcript
request template contains more than one `audio-table` ID across its steps.

## Folders, scenario IDs and journey traceability

Use business areas for folders and a unique area-based ID for each test scenario.
Use the scenario ID consistently in the test title, Scenario description and
filename. Group related scenarios by business area. The source PDF informs the
business behaviour; its journey numbering is not used to identify our tests.

The two existing specs now live under `cases/` and `transcripts/`. Their filenames,
test titles and runner commands have been updated together. Other entries below
are proposed examples for future coverage; no placeholder tests have been created.

```text
e2e/tests/
  cases/
    cs_001-find-case-and-hearing.spec.ts
  audio/
    au_001-listen-to-hearing-recording.spec.ts
  transcripts/
    tr_001-submit-transcript-request.spec.ts
    tr_002-retrieve-audio-for-transcription.spec.ts
    tr_003-approve-transcript-request.spec.ts
    tr_004-produce-and-deliver-transcript.spec.ts
    tr_005-record-unfulfilled-transcript.spec.ts
    tr_006-reject-transcript-request.spec.ts
    tr_007-request-and-receive-transcript.spec.ts
  retention/
    rt_001-review-and-update-case-retention.spec.ts
  access/
    ac_001-give-user-service-access.spec.ts
  courthouses/
    ch_001-maintain-courthouse-details.spec.ts
  annotations/
    an_001-add-and-retrieve-hearing-annotations.spec.ts
  daily-lists/
    dl_001-process-updated-daily-list.spec.ts
```

The proposed filenames describe individual scenarios, not proof that all PDF
journeys are implemented. In particular, `TR_001` only submits a request;
a separate full lifecycle scenario must include handover and requester download
before claiming request-and-receive coverage. Roles belong in fixture selection
and scenario descriptions, rather than defining the folder structure.

| Scenario ID | Folder | Representative actor | Future scenario focus |
| --- | --- | --- | --- |
| `CS_001` | `cases/` | Requester | Find a case, open its hearing, view details, events and restrictions. |
| `AU_001` | `audio/` | Requester | Preview/select times, get audio, retrieve it through Your audio and listen/save. |
| `TR_002` | `transcripts/` | Transcriber | Retrieve audio for an assigned request; this expands the audio part of transcript production and delivery. |
| `TR_007` | `transcripts/` | Requester, with handovers | Submit a request and later download the completed transcript after transcript approval/transcript production and delivery. |
| `TR_003` | `transcripts/` | Approver | Review and approve; use a different person from the requester. |
| `TR_004` | `transcripts/` | Transcriber | Assign, retrieve audio, then upload and complete; transcript preparation is outside DARTS. |
| `RT_001` | `retention/` | Judiciary | Review an eligible closed case, set retention with a reason and verify the saved details. |
| `AC_001` | `access/` | Super Admin | Create/update a user, grant role/courthouse access and verify permitted hearing access. |
| `CH_001` | `courthouses/` | Super Admin | Maintain courthouse details/jurisdiction and find the result through search. |
| `AN_001` | `annotations/` | Judiciary | Upload an annotation and retrieve the same user's saved annotation; marked low priority in the PDF. |
| `DL_001` | `daily-lists/` | Super Admin | Process the latest eligible pending Daily List for today and verify updated listing information. |
| `TR_005` | `transcripts/` | Transcriber | Mark a request unfulfilled with a reason and verify the resulting status/notification where supported. |
| `TR_006` | `transcripts/` | Approver, then Requester | Reject with a reason; the requester reviews the rejection. Requesting again is optional. |

### Naming convention

| Business area | Folder | Scenario prefix |
| --- | --- | --- |
| Cases | `cases/` | `CS` |
| Audio | `audio/` | `AU` |
| Transcripts | `transcripts/` | `TR` |
| Retention | `retention/` | `RT` |
| Access | `access/` | `AC` |
| Courthouses | `courthouses/` | `CH` |
| Annotations | `annotations/` | `AN` |
| Daily Lists | `daily-lists/` | `DL` |

- Give each scenario its own ID, using the area prefix and a zero-padded number:
  `CS_001`, `CS_002`, `TR_001`, etc. Allocate the next unused number within the area;
  do not renumber existing tests or reuse a retired ID.
- Start the test title with its uppercase scenario ID and a business outcome:
  `CS_001: The Requester can find a case and open its hearing`.
- Start the filename with the lowercase version of the same ID:
  `cases/cs_001-find-case-and-hearing.spec.ts`.
- Use the same ID and business outcome in the description:
  `Scenario: CS_001: The Requester can find a case and open its hearing.`
  Each test has one business-area scenario ID; do not add a second journey label.
- Do not add Playwright tags for IDs. Select a scenario with
  `yarn test:e2e --grep 'CS_001:'`, or select the relevant folder/file.
- Give separately implemented Crown and Magistrates scenarios their own stable
  scenario IDs. Keep them under the same business area; split into separate
  jurisdiction files only when their behaviour warrants it.
- Update the scenario ID, filename, documented example and runner paths together
  when adding or moving a spec. Existing scenario IDs remain stable as coverage grows.

### Supporting system flows

SF01-SF08 are supporting system flows, not additional UI journeys. The current
suite uses services and fixtures to establish preconditions; doing so does not
prove those system flows. Keep their traceability in setup documentation rather
than adding API-only checks under `e2e/tests`.

| PDF flow | Responsibility | Relationship to UI coverage |
| --- | --- | --- |
| SF01 | Receive/process Daily Lists | Supplies cases/hearings; the Daily List admin action is the separate admin UI trigger. |
| SF02 | Discover/ingest court recordings | Supplies stored recordings; not exercised by uploading a sample for UI setup. |
| SF03 | Link recordings to cases/hearings | Supplies linked audio used by hearing audio playback/audio retrieval for transcription. |
| SF04 | Reconcile unmatched recordings | Adds missing links through scheduled processing. |
| SF05 | Event-driven closure/retention | Supplies closed cases/retention state reviewed in case retention. |
| SF06 | Scheduled closure of aged cases | A separate retention-processing route from SF05. |
| SF07 | Magistrates reference-data setup | Supplies courts, courtrooms, jurisdiction and policy data. |
| SF08 | Receive/process court events | Supplies events and case updates used by case and hearing search and supporting processing. |

If dedicated system-flow coverage is added, it belongs in an appropriate API or
system suite, with `sf_01` etc. as its own labels. It must not be counted as covered
merely because a UI fixture calls an endpoint. Keep the UI journey specs focused
on the actor's actions and observable outcomes.

## Local logging

The default reporters are `list` for terminal progress/logs and `html` for the
report in `playwright-report/`. The HTML report does not open automatically.
After a run, open it with `yarn playwright show-report`.

Set the log level directly in `e2e/playwright.config.ts`. The local default is
`INFO`; change it to `DEBUG` when investigating a run. The same configuration is
used by the terminal and the Playwright run button.

```ts
metadata: {
  logLevel: 'INFO' satisfies LogLevel, // Change to 'DEBUG' for all available logging.
},
```

| Level | Output |
| --- | --- |
| `INFO` | Scenario start/result and duration; case/hearing/audio IDs when setup is ready; submitted transcript request ID. |
| `DEBUG` | Everything at INFO, plus fresh-auth lifecycle, setup preparation, API methods/paths/status codes/timings, audio upload/polling, and UI actions/assertions. |

Messages include a UTC timestamp, level, scenario ID, worker index and component,
so output from parallel scenarios can be distinguished. For example:

```text
2026-11-17T17:30:00.000Z [INFO] [CS_001/worker-0] [setup] Case 123 and hearing 456 ready
2026-11-17T17:30:00.100Z [DEBUG] [CS_001/worker-0] [case-search] Search for the scenario case
```

Logging lives in fixtures, flows, pages and services; keep the AAA specs unchanged.
`support/logger.ts` is the single console entry point and can be extended with
additional diagnostics later. Log explicit operations and non-secret identifiers,
not input values, environment dumps, credentials, token responses, request bodies,
SAS URLs or raw browser/network errors. DEBUG enables all available safe logging;
it does not enable Playwright's raw protocol logging or additional artifact capture.

Logging verification on 17 November 2026: both scenarios passed with INFO in
25.2 seconds with no DEBUG output; case search passed with DEBUG in 15.7 seconds,
including auth lifecycle, setup HTTP status/timing and UI progress messages.

## Agent instructions for E2E journey specs

These instructions apply to agents creating or updating the standalone tests in
`e2e/`. They are authoring guidance and must not be copied into test descriptions.

- Write Background and Given / When / Then descriptions for Business Analysts: describe business state, user actions, and observable outcomes without API, fixture, storage, or other implementation details.
- Give each scenario a unique business-area ID (`CS_001:`, `TR_001:`, etc.) in its title and filename; use the same ID in its Scenario description. Use concise AAA labels without explanatory commentary. Do not use `test.step` or add tags to these specs.
- A separate Arrange block is optional. If a fixture already establishes the Given state through API setup, use `// Arrange / Act` and start the UI journey.
- If a scenario needs its own Given-stage preparation, use a separate `// Arrange` block for scenario-specific values or UI actions that establish that state. Keep API calls and response validation in supporting fixtures/services.
- Keep intermediate navigation checks in flows/pages and final journey assertions in the spec. Keep report attachments in fixtures, not in business specs.
- Put each screen in the Route description on a separate line. Do not add Coverage boundary blocks.
- Keep logs in supporting layers via the shared logger. Default to INFO and use DEBUG for detailed local diagnostics. Do not log secrets, payloads or raw errors.
- Keep agent instructions out of test comments and business scenario descriptions.


## What a completed journey spec should look like

A spec should read as a DARTS user journey from its first line to its final
assertion. Keep browser login, storage-state files, HTTP payloads and selectors in
the supporting layers. Request the prepared data and page objects as typed
fixtures, then describe the user's actions and the outcomes they can observe.
Flows compose page actions and intermediate checks; specs call the flow and assert
the final journey outcome. The transcript-request flow opens the hearing, completes
and submits the request, checks confirmation and returns to the hearing. Its fixture
attaches created request IDs during teardown, including when a later UI check fails.
Keep `testInfo.attach` and other reporting plumbing out of business specs.
API calls, HTTP status/response checks and data read-back belong in setup fixtures
and services. The **Background** and **Given / When / Then** statements describe
business facts, user actions and outcomes for a Business Analyst. For example,
write "The Requester is signed in and has access to the courthouse" and "A hearing
with audio is available", rather than describing how the data or session was
prepared. Keep API, fixture, storage and HTTP details in the technical setup
documentation. The test body contains UI flow/page actions and final outcome assertions;
it must not perform API requests or assert API responses.

Use the following shape for each completed spec:

| Part | What to include | DARTS example |
| --- | --- | --- |
| Imports | The composed test fixture and named-user definition. | `test` from `../../fixtures/test`; `AuthUser` from `../../setup/users`. |
| Actor | A file-scoped user selection for the scenario. | `test.use({ authUser: AuthUser.AUTOMATION })` for the current runs. |
| Title | A unique scenario ID followed by an observable business outcome. | `CS_001: The Requester can find a case and open its hearing`. |
| Background | Business context shared by the scenario; describe what is already true. | The Requester is signed in and has access to the courthouse. |
| Given / When / Then | Business preconditions, user actions and observable results, without implementation details. | A case has a hearing; the Requester searches for it and can view the correct hearing details. |
| Route | The screens visited, each on a separate comment line. | Case search, then Case details, then Hearing details. |
| Arrange | Use the background fixture data and select UI scenario options; no API calls or API checks. | `createdCase` or `hearingWithAudio`; Court Log / Overnight options. |
| Act / Assert | Awaited flow or page actions followed by observable outcome assertions, using AAA comments. | Search, check the matching result, open the case, then verify its hearing. |
| Evidence | Non-secret IDs recorded by fixtures to investigate failures; no reporting plumbing in the spec. | Case/hearing/audio IDs from setup; submitted request IDs collected by the flow and attached by its fixture. |

Use plain `// Arrange`, `// Act` and `// Assert` labels, without explanatory
commentary. Combine `// Arrange / Act` when no separate arrangement code is needed.
Call flow or page methods without wrapping them in named steps: the method names
and AAA structure already describe the test. Checks needed before navigating away
from a screen can sit alongside that action. Use Given / When / Then for a short
business description, not as Cucumber step definitions.

### Completed example: find a case and hearing

This is the full shape of `tests/cases/cs_001-find-case-and-hearing.spec.ts`, using its real fixtures and
page methods. The setup fixture creates the case and actual hearing independently
for this test. `flows/case-search.flow.ts` searches, checks the matching result,
opens the case, verifies its details and opens the hearing. The spec then asserts
the hearing outcome. Intermediate case checks stay in the flow rather than being
repeated in the spec.

```ts
import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';
import { findCaseAndOpenHearing } from '../../flows/case-search.flow';

test.use({ authUser: AuthUser.AUTOMATION });

test('CS_001: The Requester can find a case and open its hearing', async ({
  caseSearch,
  casePage,
  hearingPage,
  caseWithInterpreter: createdCase,
}) => {
  /**
   * Scenario: CS_001: The Requester can find a case and open its hearing.
   *
   * Background
   * - The Requester is signed in and has access to the courthouse.
   *
   * Given
   * - A case with a hearing is available to the Requester.
   *
   * When
   * - The Requester searches for the exact case ID.
   * - The Requester opens the matching case and its hearing.
   *
   * Then
   * - The result shows the expected case ID, courthouse, courtroom and defendant.
   * - The case and hearing details match the selected case.
   * - The hearing shows the expected courthouse, courtroom and hearing-start event.
   *
   * Route
   *   Case search
   *   -> Case details
   *   -> Hearing details
   */

  // Arrange / Act
  await findCaseAndOpenHearing(caseSearch, casePage, createdCase);

  // Assert
  await hearingPage.expectHearing(createdCase.id, createdCase.hearingId);
  await hearingPage.expectDetails(createdCase);
  await hearingPage.expectEvent(`PW case-search setup ${createdCase.number}`);
});
```

The final checks verify the selected case and hearing through their displayed
business details and browser navigation. Seeing a generic search heading, any result, or any hearing
would not prove this scenario. The scope is the documented Crown happy path;
the code does not claim to cover reporting-restriction or Magistrates variations.

## Adding another journey

1. Choose the PDF journey ID and state which segment and actor the spec covers.
   Record exclusions, especially cross-actor handovers and alternative outcomes.
2. Pick a named `AuthUser` with the required permissions. For new identities, add
   the env mapping in `setup/users.ts`, document it in `.env.example`, and inject
   credentials through approved loading. Avoid account permissions broader than
   the behaviour being tested when establishing role coverage.
3. Define typed, unique input data in `data/`. Keep endpoint paths, tokens and
   credentials out of data builders.
4. Add create/get operations to a focused `services/*.service.ts`. Validate unknown
   response shapes and identifiers. Keep HTTP/authentication in the transport;
   do not duplicate login or headers in specs/pages.
5. Wire API preparation and response validation into a setup fixture. In the
   spec's Background and Given statements, describe only the resulting business
   context and preconditions. Keep preparation mechanisms in setup documentation.
   Attach non-secret IDs so partial setup failures can be investigated.
6. Read the portal template before adding a locator. Keep locators in pages and
   use awaited, retrying assertions for observable state. Avoid fixed sleeps and
   retries around non-idempotent submissions.
7. Write the business spec using Arrange / Act / Assert and direct awaited page
   methods. Use API preparation for preconditions; perform the action under test
   in the UI.
8. Run typecheck, lint and test discovery. Then validate in
   an explicitly selected PR environment. Record the target, commit and evidence;
   distinguish worker parallelism from independent shards and merged CI reports.

## Execution and data ownership

```sh
yarn typecheck:e2e
yarn lint
yarn test:e2e --list
yarn test:e2e --grep "find a case and open its hearing" --list
yarn test:e2e --list --shard=1/2
yarn test:e2e --list --shard=2/2
```

The suite contains only the two business journey specs. Services, data builders and
authentication are supporting code, with no additional framework test suites.

For a live run, supply matching `DARTS_PORTAL` / `DARTS_API` API-owned dev PR origins,
browser/API credentials and, for transcripts, the matching inbound-container SAS.
See the root README for environment variables and direct Yarn commands. Case creation is restricted
to matching API-owned dev PRs; there is no staging fallback. SAS URLs, tokens and
passwords must not be logged or attached.

Every run creates unique case numbers, courtrooms, message IDs and audio blob IDs.
Synthetic records/blobs remain because scoped teardown is unavailable. Never use
`/functional-tests/clean` as per-test cleanup: it can delete another run's data.
Review accumulation before increasing CI frequency. Account-level state, storage
alignment and shared databases remain environment dependencies.

### Latest live verification

On 17 November 2026, both current scenarios passed against API/portal PR 3503
using the existing external automation account, Harrow Crown Court and two workers:

| Scenario | Result | Test duration |
| --- | --- | --- |
| CS_001: find a case and open its hearing | Passed | 11.6 seconds |
| TR_001: submit a transcript request | Passed | 14.9 seconds |

Total run time was 26.5 seconds, including fresh authentication and setup. Each
worker logged in from an empty browser context with no existing storage state;
worker-owned auth files were removed at teardown. Results were written under
`e2e/test-results/fresh-vpn-fixed-20261117`. This verifies worker parallelism;
independent live shards and the external Jenkins report merge remain unverified.

Case details are unavailable until an actual hearing exists. Setup therefore posts
the hearing-start event before reading back the case. Initial transcript comments
are optional, while the UI requires judge-authorisation confirmation. The existing
Cucumber Court Log example supplies an optional comment and checks the
authorisation checkbox. Our UI scenario supplies only the required authorisation;
the optional comment is left blank. This minimal-input version of `TR_001`
was verified with fresh authentication on 17 November 2026: passed in 21.5 seconds
overall (11.3 seconds test duration). Initial submission returns HTTP 200; workflow comments
are mandatory when later marking a request Rejected or Unfulfilled.

## CI integration in darts-api

The local `darts-api` checkout has been updated to supply the environment required
by these scenarios. `Jenkinsfile_CNP` passes the deployed API `TEST_URL` and selected
portal URL to `bin/ci/playwright-e2e.groovy`. The runner rejects missing/mismatched
PR targets and the staging portal fallback before allocating the Playwright agents.

Each shard receives `DARTS_PORTAL`, `DARTS_API`, `E2E_LOGIN_ROUTE=external`, `CI=true`
and its shard index/count. Inside each shard, Jenkins loads these seven secrets
explicitly from `darts-${environment}` (the current callback selects `stg`):

| Variable | Secret |
| --- | --- |
| `AUTOMATION_USERNAME` | `AutomationTestUserName` |
| `AUTOMATION_PASSWORD` | `AutomationTestPassword` |
| `AAD_B2C_ROPC_CLIENT_ID` | `AzureAdB2CFuncTestROPCClientId` |
| `AAD_B2C_ROPC_CLIENT_SECRET` | `AzureAdB2CFuncTestROPCClientSecret` |
| `AZURE_AD_FUNCTIONAL_TEST_GLOBAL_USERNAME` | `AzureAdB2CFuncTestROPCGlobalUsername` |
| `AZURE_AD_FUNCTIONAL_TEST_GLOBAL_PASSWORD` | `AzureAdB2CFuncTestROPCGlobalPassword` |
| `E2E_AUDIO_INBOUND_SAS_URL` | `DartsInboundStorageSasUrl` |

The inbound SAS must match the storage used by the PR API. The optional
`E2E_DATA_COURTHOUSE` defaults to `HARROW CROWN COURT`. No `.env` file or stored auth
state is required in Jenkins; both authentication processes inherit injected values.

The shell runner checks every required variable, shard parameters and matching
PR URLs before starting Node or browsers. Setup installs dependencies with the
pinned Yarn version, runs `yarn typecheck:e2e` and installs Chromium. The two-agent
sharding and merged HTML/JSON reports remain in place. Auth state is outside the
archived artifact paths, and required-variable errors never print secret values.

Apply `pw_e2e` or `pw_e2e_branch`, plus `enable_keep_helm` and `enable_darts_portal`
(with the supported image suffix if needed). The stage runs after successful API
functional tests. It still checks out the spike branch configured in the runner;
commit and push changes in both repos before triggering the Jenkins build.

Local validation covered Groovy compilation, label/fork gates, matching PR guards,
all required/blank variables, secret-safe shell output and each shard's environment
and secret mappings. Applied files exactly match the validated patch. A live
Jenkins run is still needed to verify agent access, both real shards and the
combined report end to end.
