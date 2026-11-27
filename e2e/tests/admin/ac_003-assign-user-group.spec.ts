import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.ADMIN });

test('AC_003: The Admin can assign a user to a security group', async ({
  userToCreate,
  groupToAssign,
  createUserFlow,
  assignUserGroupFlow,
  adminUsers,
}) => {
  /**
   * Scenario: AC_003: The Admin can assign a user to a security group.
   *
   * Background
   * - The Admin is signed in and can manage DARTS users and their groups.
   *
   * Given
   * - An active user has been created and is not a member of any groups.
   * - The Swansea_APPROVER security group is available with the Approver role.
   *
   * When
   * - The Admin opens the user's groups and chooses to assign a group.
   * - The Admin filters by group name and selects Swansea_APPROVER.
   * - The Admin reviews the single selection and confirms the assignment.
   * - The Admin finds the user again and reopens their groups.
   *
   * Then
   * - The Admin sees confirmation that one group was assigned.
   * - The user's saved groups contain Swansea_APPROVER with the Approver role.
   * - The user remains active and has exactly one assigned group.
   *
   * Route
   *   Admin Portal
   *   -> Users
   *   -> Create user
   *   -> User record
   *   -> Groups
   *   -> Assign groups
   *   -> User record
   *   -> Search for user
   *   -> User record
   *   -> Groups
   */

  // Arrange
  const userId = await createUserFlow.createAndFind(userToCreate);

  // Act
  await assignUserGroupFlow.assignAndReopen(userToCreate, groupToAssign, userId);

  // Assert
  await adminUsers.expectGroup(groupToAssign, userId);
});
