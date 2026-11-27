import { type NewUserDetails } from '../data/user';
import { type AdminUsersPage } from '../pages/admin-users.page';

export class UpdateUserFlow {
  constructor(private readonly users: AdminUsersPage) {}

  async updateAndFind(
    original: NewUserDetails,
    changes: NewUserDetails,
    id: number,
  ): Promise<void> {
    await this.users.update(original, changes, id);
    await this.users.findAndOpen(changes, id);
  }
}
