import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.TRANSCRIBER });

test('CS_010: The Transcriber can view hearings in newest-first order', async ({
  hearingHistory,
  hearingHistoryFlow,
  casePage,
}) => {
  /**
   * Scenario: CS_010: The Transcriber can view hearings in newest-first order.
   *
   * Background
   * - The Transcriber is signed in and has access to the courthouse.
   *
   * Given
   * - A case has hearings on three different dates.
   * - Each hearing has an identifiable date and courtroom.
   *
   * When
   * - The Transcriber opens the case and sorts its hearings by date, newest first.
   *
   * Then
   * - All three hearings are listed from the latest date to the earliest date.
   * - Each row retains the correct hearing date, courtroom and link to that hearing.
   * - No hearings are lost or duplicated when the order changes.
   *
   * Route
   *   Case details
   */

  // Arrange / Act
  await hearingHistoryFlow.sort(hearingHistory, 'Hearing date', 'descending');

  // Assert
  await casePage.expectHearingOrder(hearingHistory, 'Hearing date', 'descending');
});
