import { type SecurityGroupDetails } from '../data/security-group';
import { type NewUserDetails } from '../data/user';
import { type AdminUsersPage } from '../pages/admin-users.page';

export class AssignUserGroupFlow {
  constructor(private readonly users: AdminUsersPage) {}

  async assign(group: SecurityGroupDetails, id: number): Promise<void> {
    await this.users.assignGroup(group, id);
  }

  async assignAndReopen(user: NewUserDetails, group: SecurityGroupDetails, id: number): Promise<void> {
    await this.assign(group, id);
    await this.users.findAndOpen(user, id);
    await this.users.expectRecord(user, id);
    await this.users.openGroups();
  }
}
