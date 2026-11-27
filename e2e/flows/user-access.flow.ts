import { type NewUserDetails } from '../data/user';
import { type AdminUsersPage } from '../pages/admin-users.page';

export class UserAccessFlow {
  constructor(private readonly users: AdminUsersPage) {}

  async deactivateAndReactivate(user: NewUserDetails, id: number): Promise<void> {
    await this.users.deactivate(user, id);
    await this.users.findAndOpen(user, id, 'Inactive');
    await this.users.expectRecord(user, id, 'Inactive');
    await this.users.expectNoGroups();
    await this.users.openDetails();
    await this.users.reactivate(user, id);
    await this.users.expectNoGroups();
    await this.users.findAndOpen(user, id);
  }
}
