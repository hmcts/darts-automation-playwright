import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.TRANSCRIBER });

test('CS_006: The Transcriber can find a restricted case using event keywords and hearing dates', async ({
  advancedSearchFlow,
  restrictedEventHearing,
  hearingPage,
}) => {
  /**
   * Scenario: CS_006: The Transcriber can find a restricted case using event keywords and hearing dates.
   *
   * Background
   * - The Transcriber is signed in and has access to the courthouse.
   *
   * Given
   * - A case has a hearing with a reporting-restriction event containing distinctive words.
   * - The hearing falls within the dates the Transcriber wants to search.
   *
   * When
   * - The Transcriber searches by courthouse, words from the event and a hearing-date range.
   * - The Transcriber opens the matching case and its hearing.
   *
   * Then
   * - The search result identifies the expected case, courthouse, courtroom and defendant.
   * - The result warns that there are restrictions against this case.
   * - The selected hearing contains the reporting-restriction event with the searched words.
   *
   * Route
   *   Case search
   *   -> Advanced search
   *   -> Search results
   *   -> Case details
   *   -> Hearing details
   */

  // Arrange / Act
  await advancedSearchFlow.findByReportingRestriction(restrictedEventHearing);

  // Assert
  await hearingPage.expectHearing(restrictedEventHearing.id, restrictedEventHearing.hearingId);
  await hearingPage.expectDetails(restrictedEventHearing);
  await hearingPage.expectEvent(restrictedEventHearing.keywords);
});
