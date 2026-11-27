import { type NewUserDetails } from '../data/user';
import { type AdminUsersPage } from '../pages/admin-users.page';

export class CreateUserFlow {
  constructor(private readonly users: AdminUsersPage) {}

  async create(user: NewUserDetails): Promise<number> {
    await this.users.open();
    return this.users.create(user);
  }

  async createAndFind(user: NewUserDetails): Promise<number> {
    const id = await this.create(user);
    await this.users.findAndOpen(user, id);
    return id;
  }
}
