import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.TRANSCRIBER });

test('CS_008: The Transcriber can return to their previous search after navigation', async ({
  advancedSearchFlow,
  createdCase,
  caseSearch,
}) => {
  /**
   * Scenario: CS_008: The Transcriber can return to their previous search after navigation.
   *
   * Background
   * - The Transcriber is signed in and has access to the courthouse.
   *
   * Given
   * - A case with a hearing is available to the Transcriber.
   * - The Transcriber can identify it by courthouse, judge and defendant.
   *
   * When
   * - The Transcriber searches using those details and views the matching result.
   * - The Transcriber visits Your audio and returns through the Search link.
   * - The Transcriber opens the matching case and returns through its Search breadcrumb.
   *
   * Then
   * - The original search criteria remain populated after each return.
   * - The matching case remains in the results with the same courthouse, courtroom, judge and defendant.
   * - The Transcriber does not need to enter the criteria or submit the search again.
   *
   * Route
   *   Case search
   *   -> Advanced search
   *   -> Search results
   *   -> Your audio
   *   -> Search results
   *   -> Case details
   *   -> Search results
   */

  // Arrange / Act
  await advancedSearchFlow.returnToPreviousSearch(createdCase);

  // Assert
  await caseSearch.expectPeopleCriteria(createdCase);
  await caseSearch.expectCaseInResults(createdCase);
  await caseSearch.expectJudgeInResults(createdCase.number, createdCase.judge);
});
