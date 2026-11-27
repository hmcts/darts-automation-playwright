import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.ADMIN });

test('AC_002: The Admin can update a user’s details and find their saved changes', async ({
  userToCreate,
  userChanges,
  createUserFlow,
  updateUserFlow,
  adminUsers,
}) => {
  /**
   * Scenario: AC_002: The Admin can update a user’s details and find their saved changes.
   *
   * Background
   * - The Admin is signed in and can manage DARTS users.
   *
   * Given
   * - The Admin has created an active user with a name, email address and description.
   * - A new name, unused email address and description are available for that user.
   *
   * When
   * - The Admin edits the user's name, email address and description.
   * - The Admin reviews the previous and new email addresses and confirms the change.
   * - The Admin searches using the new email address and opens the matching record.
   *
   * Then
   * - The Admin sees confirmation that the user has been updated.
   * - The same user's saved record contains the new name, email and description.
   * - The user remains active.
   *
   * Route
   *   Admin Portal
   *   -> Users
   *   -> Create user
   *   -> User record
   *   -> Edit user record
   *   -> Confirm email change
   *   -> User record
   *   -> Search for user
   *   -> User record
   */

  // Arrange
  const userId = await createUserFlow.createAndFind(userToCreate);

  // Act
  await updateUserFlow.updateAndFind(userToCreate, userChanges, userId);

  // Assert
  await adminUsers.expectRecord(userChanges, userId);
});
