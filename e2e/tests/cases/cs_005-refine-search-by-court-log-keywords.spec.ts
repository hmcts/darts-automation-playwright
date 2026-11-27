import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.TRANSCRIBER });

test('CS_005: The Transcriber can refine an advanced search using court-log keywords', async ({
  advancedSearchFlow,
  courtLogHearing,
  hearingPage,
}) => {
  /**
   * Scenario: CS_005: The Transcriber can refine an advanced search using court-log keywords.
   *
   * Background
   * - The Transcriber is signed in and has access to the courthouse.
   *
   * Given
   * - A case has a hearing and a court log containing distinctive words.
   * - The Transcriber knows the courthouse, courtroom and hearing date.
   *
   * When
   * - The Transcriber searches by courthouse and words from the court log.
   * - When asked for more information, the Transcriber adds the courtroom and hearing date.
   * - The Transcriber opens the matching case and its hearing.
   *
   * Then
   * - The search result identifies the expected case, courthouse, courtroom and defendant.
   * - The selected hearing contains the court log with the searched words.
   *
   * Route
   *   Case search
   *   -> Advanced search
   *   -> Refine your search
   *   -> Search results
   *   -> Case details
   *   -> Hearing details
   */

  // Arrange / Act
  await advancedSearchFlow.refineCourtLogSearch(courtLogHearing);

  // Assert
  await hearingPage.expectHearing(courtLogHearing.id, courtLogHearing.hearingId);
  await hearingPage.expectDetails(courtLogHearing);
  await hearingPage.expectEvent(courtLogHearing.keywords);
});
