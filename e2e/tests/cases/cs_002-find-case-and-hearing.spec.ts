// Temporary duplicate for Jenkins sharding and worker validation; remove after the parallel execution check.
import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';
import { findCaseAndOpenHearing } from '../../flows/case-search.flow';

test.use({ authUser: AuthUser.AUTOMATION });

test('CS_002: The Requester can find a case and open its hearing', async ({
  caseSearch,
  casePage,
  hearingPage,
  caseWithInterpreter: createdCase,
}) => {
  /**
   * Scenario: CS_002: The Requester can find a case and open its hearing.
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
