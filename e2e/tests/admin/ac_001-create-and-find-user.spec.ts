import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.ADMIN });

test('AC_001: The Admin can create a user and find their saved record', async ({
  userToCreate,
  createUserFlow,
  adminUsers,
}) => {
  /**
   * Scenario: AC_001: The Admin can create a user and find their saved record.
   *
   * Background
   * - The Admin is signed in and can manage DARTS users.
   *
   * Given
   * - A new user's full name, email address and description are available.
   * - No user has already been registered with that email address.
   *
   * When
   * - The Admin opens Users and enters the new user's details.
   * - The Admin reviews the details and confirms creation.
   * - The Admin searches for the new user by email and opens the matching record.
   *
   * Then
   * - The Admin sees confirmation that the user record has been created.
   * - The saved name, email and description match the reviewed details.
   * - The user is listed as active and the search opens the same saved record.
   *
   * Route
   *   Admin Portal
   *   -> Users
   *   -> Enter user details
   *   -> Check user details
   *   -> User record
   *   -> Search for user
   *   -> User record
   */

  // Arrange / Act
  const userId = await createUserFlow.createAndFind(userToCreate);

  // Assert
  await adminUsers.expectRecord(userToCreate, userId);
});
