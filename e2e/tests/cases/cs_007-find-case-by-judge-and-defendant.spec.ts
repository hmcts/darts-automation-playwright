import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.TRANSCRIBER });

test('CS_007: The Transcriber can find a case using judge and defendant details', async ({
  advancedSearchFlow,
  createdCase,
  hearingPage,
}) => {
  /**
   * Scenario: CS_007: The Transcriber can find a case using judge and defendant details.
   *
   * Background
   * - The Transcriber is signed in and has access to the courthouse.
   *
   * Given
   * - A case has a hearing with a known judge and defendant.
   * - The Transcriber knows the courthouse but is searching without the case ID.
   *
   * When
   * - The Transcriber searches by courthouse, judge's name and defendant's name.
   * - The Transcriber opens the matching case and its hearing.
   *
   * Then
   * - The search result shows the expected case, courthouse, courtroom, judge and defendant.
   * - The case and hearing details match the selected result.
   *
   * Route
   *   Case search
   *   -> Advanced search
   *   -> Search results
   *   -> Case details
   *   -> Hearing details
   */

  // Arrange / Act
  await advancedSearchFlow.findByJudgeAndDefendant(createdCase);

  // Assert
  await hearingPage.expectHearing(createdCase.id, createdCase.hearingId);
  await hearingPage.expectDetails(createdCase);
});
