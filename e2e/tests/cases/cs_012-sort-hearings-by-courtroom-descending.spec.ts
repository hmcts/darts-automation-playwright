import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.TRANSCRIBER });

test('CS_012: The Transcriber can view hearings in reverse alphabetical courtroom order', async ({
  hearingHistory,
  hearingHistoryFlow,
  casePage,
}) => {
  /**
   * Scenario: CS_012: The Transcriber can view hearings in reverse alphabetical courtroom order.
   *
   * Background
   * - The Transcriber is signed in and has access to the courthouse.
   *
   * Given
   * - A case has hearings in three different courtrooms on different dates.
   * - Each hearing has an identifiable date and courtroom.
   *
   * When
   * - The Transcriber opens the case and sorts its hearings by courtroom from Z to A.
   *
   * Then
   * - All three hearings are listed in reverse alphabetical courtroom order.
   * - Each row retains the correct hearing date, courtroom and link to that hearing.
   * - No hearings are lost or duplicated when the order changes.
   *
   * Route
   *   Case details
   */

  // Arrange / Act
  await hearingHistoryFlow.sort(hearingHistory, 'Courtroom', 'descending');

  // Assert
  await casePage.expectHearingOrder(hearingHistory, 'Courtroom', 'descending');
});
