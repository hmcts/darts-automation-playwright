import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.ADMIN });

test('AC_004: The Admin can deactivate and reactivate a user', async ({
  userToCreate,
  groupToAssign,
  createUserFlow,
  assignUserGroupFlow,
  userAccessFlow,
  adminUsers,
}) => {
  /**
   * Scenario: AC_004: The Admin can deactivate and reactivate a user.
   *
   * Background
   * - The Admin is signed in and can manage DARTS users.
   *
   * Given
   * - An active user has been created and belongs to the Swansea_APPROVER group.
   *
   * When
   * - The Admin reviews the warning and confirms deactivation.
   * - The Admin finds the user among inactive users and opens their record.
   * - The Admin reviews the warning and confirms reactivation.
   * - The Admin finds the user again among active users.
   *
   * Then
   * - The Admin sees confirmation of deactivation and the inactive status.
   * - Deactivation removes the user's group membership.
   * - The Admin sees confirmation of reactivation and the active status.
   * - The same user's name, email and description are retained.
   * - Reactivation does not restore the previous group membership.
   *
   * Route
   *   Admin Portal
   *   -> Users
   *   -> Create user
   *   -> Assign groups
   *   -> User record
   *   -> Deactivate user
   *   -> Search for inactive user
   *   -> User record
   *   -> Reactivate user
   *   -> Search for active user
   *   -> User record
   */

  // Arrange
  const userId = await createUserFlow.create(userToCreate);
  await assignUserGroupFlow.assign(groupToAssign, userId);

  // Act
  await userAccessFlow.deactivateAndReactivate(userToCreate, userId);

  // Assert
  await adminUsers.expectRecord(userToCreate, userId);
});
