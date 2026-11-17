import { test } from '../fixtures';

test('a user can find a case created through the API', async ({
  caseSearch,
  casePage,
  caseWithInterpreter: createdCase,
}) => {
  /*
   * Existing coverage: features/portal/DARTS_Case_Search.feature
   * Scenario: "Simple and Advanced Case Search" (simple-search happy path).
   * This example focuses on an exact case ID; the existing scenario also covers
   * partial-ID searches, sorting and advanced filters as an approver.
   * The automation account also has TRANSLATION_QA, so its search requires interpreter use.
   *
   * GIVEN a signed-in user and a Crown Court hearing where an interpreter was used
   * WHEN the user searches for the case by its case ID
   * THEN the correct case is returned and its details can be opened and verified
   */

  // API preparation (caseWithInterpreter): create a unique case and courtroom,
  // an actual hearing, and an interpreter-sworn event. Browser login is handled
  // separately by the authentication setup. The steps below exercise the UI.

  await test.step('Search for the case by its unique case ID', async () => {
    await caseSearch.search(createdCase.number);
  });

  await test.step('Verify the case details returned in search results', async () => {
    await caseSearch.expectCaseInResults(createdCase);
  });

  await test.step('Open the result and verify it is the API-created case', async () => {
    await caseSearch.openCase(createdCase.number);
    await casePage.expectCaseDetails(createdCase);
  });
});
