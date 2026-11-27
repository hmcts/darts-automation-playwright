import { expect, type Locator, type Page } from '@playwright/test';
import { type NewUserDetails } from '../data/user';
import { type SecurityGroupDetails } from '../data/security-group';
import { createLogger } from '../support/logger';

const log = createLogger('admin-users');

export class AdminUsersPage {
  readonly createdUsers: { id: number; email: string }[] = [];

  constructor(private readonly page: Page) {}

  private async waitForLoading(): Promise<void> {
    await expect(this.page.locator('app-loading:visible')).toHaveCount(0, {
      timeout: 30_000,
    });
  }

  private async waitForRecord(user: NewUserDetails, id: number): Promise<void> {
    await expect(this.page).toHaveURL((url) => url.pathname === `/admin/users/${id}`);
    // The URL changes before the record's security groups and roles finish loading.
    // A visible user heading proves the record has rendered, even if a spinner
    // check made immediately after navigation would have completed too early.
    await expect(
      this.page.locator('app-user-record').getByRole('heading', {
        name: user.fullName,
        exact: true,
      }),
    ).toBeVisible({ timeout: 30_000 });
    await this.waitForLoading();
  }

  private async enterDetails(user: NewUserDetails): Promise<Locator> {
    const form = this.page.locator('app-create-update-user-form');
    await form.getByLabel('Full name', { exact: true }).fill(user.fullName);
    await form.getByLabel('Email', { exact: true }).fill(user.email);
    await form.getByLabel('Description (optional)', { exact: true }).fill(user.description);
    // Submission is ignored while the asynchronous email validation is pending.
    // This check has no spinner, so wait for Angular's rendered form state.
    await expect(form.locator('form')).toHaveClass(/\bng-valid\b/, { timeout: 30_000 });
    await this.waitForLoading();
    return form;
  }

  async open(): Promise<void> {
    log.debug('Switch to the Admin Portal and open Users');
    await this.page.goto('/search');
    await this.page.getByRole('link', { name: 'Switch to Admin Portal', exact: true }).click();
    await expect(this.page).toHaveURL(
      (url) => url.pathname === '/admin' || url.pathname.startsWith('/admin/'),
    );
    await this.openUserSearch();
  }

  private async openUserSearch(): Promise<void> {
    await this.page
      .getByRole('navigation', { name: 'Primary navigation', exact: true })
      .getByRole('link', { name: 'Users', exact: true })
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Search for user', exact: true }),
    ).toBeVisible();
    await this.waitForLoading();
  }

  async create(user: NewUserDetails): Promise<number> {
    log.debug('Enter and review the new user details');
    await this.page.getByRole('button', { name: 'Create new user', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: /Enter user details$/ })).toBeVisible();
    await this.waitForLoading();
    const form = await this.enterDetails(user);
    await form.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: /Check user details$/ })).toBeVisible();
    const review = this.page.locator('app-create-update-user-confirmation');
    for (const value of [user.fullName, user.email, user.description]) {
      await expect(review.getByRole('definition').filter({ hasText: value })).toHaveText(value);
    }
    await review.getByRole('button', { name: 'Create user', exact: true }).click();
    await expect(this.page).toHaveURL((url) => /^\/admin\/users\/[1-9]\d*$/.test(url.pathname));
    await this.waitForLoading();
    const id = Number(new URL(this.page.url()).pathname.split('/').pop());
    this.createdUsers.push({ id, email: user.email });
    log.info(`User record ${id} created`);
    await expect(
      this.page.getByText(`User record has been created for ${user.fullName}`, { exact: true }),
    ).toBeVisible();
    await this.expectRecord(user, id);
    return id;
  }

  async update(original: NewUserDetails, changes: NewUserDetails, id: number): Promise<void> {
    log.debug(`Edit user record ${id} and confirm the email change`);
    await this.expectRecord(original, id);
    await this.waitForLoading();
    await this.page.getByRole('button', { name: 'Edit user', exact: true }).click();
    const edit = this.page.locator('app-edit-user');
    await expect(edit.getByRole('heading')).toContainText('Edit user record');
    const form = this.page.locator('app-create-update-user-form');
    await expect(form.getByLabel('Full name', { exact: true })).toHaveValue(original.fullName);
    await expect(form.getByLabel('Email', { exact: true })).toHaveValue(original.email);
    await expect(form.getByLabel('Description (optional)', { exact: true })).toHaveValue(
      original.description,
    );
    await this.enterDetails(changes);
    await form.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(edit.getByRole('heading')).toContainText(
      'Are you sure you want to change this user’s email address?',
    );
    const confirmation = edit.locator('app-edit-email-confirmation');
    await expect(confirmation.locator('#old-email')).toContainText(original.email);
    await expect(confirmation.locator('#new-email')).toContainText(changes.email);
    await confirmation.getByRole('button', { name: 'Yes - continue', exact: true }).click();
    await expect(this.page).toHaveURL((url) => url.pathname === `/admin/users/${id}`);
    await this.waitForLoading();
    await expect(this.page.getByText('User updated', { exact: true })).toBeVisible();
    const created = this.createdUsers.find((user) => user.id === id);
    if (created) created.email = changes.email;
    log.info(`User record ${id} updated`);
    await this.expectRecord(changes, id);
  }

  async openGroups(): Promise<void> {
    await this.page.locator('#groups-tab').click();
    await expect(this.page.locator('app-user-groups')).toBeVisible();
    await this.waitForLoading();
  }

  async assignGroup(group: SecurityGroupDetails, id: number): Promise<void> {
    log.debug(`Assign ${group.name} to user record ${id}`);
    await this.openGroups();
    await expect(
      this.page.getByText('This user is not a member of any groups.', { exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Assign groups', exact: true }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Assign groups', exact: true }),
    ).toBeVisible();
    await this.waitForLoading();
    const selector = this.page.locator('app-security-group-selector');
    await expect(selector).toBeVisible();
    await selector.getByLabel('Filter by group name', { exact: true }).fill(group.name);
    const row = selector.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: group.name, exact: true }),
    });
    await expect(row).toHaveCount(1);
    await expect(row.getByRole('cell', { name: group.role, exact: true })).toBeVisible();
    await row.getByRole('checkbox').check();
    await expect(
      selector.getByRole('heading', { name: '1 groups selected', exact: true }),
    ).toBeVisible();
    await selector.getByRole('button', { name: 'Assign groups (1)', exact: true }).click();
    await expect(this.page).toHaveURL((url) => url.pathname === `/admin/users/${id}`);
    await this.waitForLoading();
    await expect(this.page.getByText('Assigned 1 group', { exact: true })).toBeVisible();
    await this.expectGroup(group, id);
    log.info(`Group ${group.name} assigned to user record ${id}`);
  }

  async expectGroup(group: SecurityGroupDetails, id: number): Promise<void> {
    await expect(this.page).toHaveURL((url) => url.pathname === `/admin/users/${id}`);
    const table = this.page.getByRole('table', { name: 'Groups assigned to user', exact: true });
    const row = table.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: group.name, exact: true }),
    });
    await expect(row).toHaveCount(1);
    await expect(row.getByRole('cell', { name: group.role, exact: true })).toBeVisible();
    await expect(table.locator('tbody').getByRole('row')).toHaveCount(1);
    await expect(
      this.page.locator('app-user-record').getByText('Active user', { exact: true }),
    ).toBeVisible();
  }

  async openDetails(): Promise<void> {
    await this.page
      .getByRole('navigation', { name: 'Sub navigation', exact: true })
      .getByRole('link', { name: 'Details', exact: true })
      .click();
    await expect(this.page.locator('app-user-record').getByRole('definition')).toHaveCount(3);
  }

  async expectNoGroups(): Promise<void> {
    await this.openGroups();
    await expect(
      this.page.getByText('This user is not a member of any groups.', { exact: true }),
    ).toBeVisible();
  }

  async deactivate(user: NewUserDetails, id: number): Promise<void> {
    log.debug(`Deactivate user record ${id}`);
    await expect(this.page).toHaveURL((url) => url.pathname === `/admin/users/${id}`);
    await this.waitForLoading();
    await this.page.getByRole('button', { name: 'Deactivate user', exact: true }).click();
    const confirmation = this.page.locator('app-deactivate-user');
    await expect(
      confirmation.getByRole('heading', { name: `Deactivate user ${user.fullName}`, exact: true }),
    ).toBeVisible();
    await expect(
      confirmation.getByText('Deactivating this user will remove their access to DARTS.', {
        exact: true,
      }),
    ).toBeVisible();
    await this.waitForLoading();
    await confirmation.getByRole('button', { name: 'Deactivate user', exact: true }).click();
    await expect(this.page).toHaveURL((url) => url.pathname === `/admin/users/${id}`);
    await this.waitForLoading();
    await expect(this.page.getByText('User record deactivated', { exact: true })).toBeVisible();
    await this.expectRecord(user, id, 'Inactive');
    log.info(`User record ${id} deactivated`);
  }

  async reactivate(user: NewUserDetails, id: number): Promise<void> {
    log.debug(`Reactivate user record ${id}`);
    await this.expectRecord(user, id, 'Inactive');
    await this.page.getByRole('button', { name: 'Activate user', exact: true }).click();
    const confirmation = this.page.locator('app-activate-user');
    await expect(
      confirmation.getByRole('heading', { name: `Reactivate user ${user.fullName}`, exact: true }),
    ).toBeVisible();
    await expect(confirmation).toContainText(
      'Reactivating this user will give them access to DARTS. They will not be able to see any data until they are added to at least one group.',
    );
    await confirmation.getByRole('button', { name: 'Reactivate user', exact: true }).click();
    await expect(this.page).toHaveURL((url) => url.pathname === `/admin/users/${id}`);
    await this.waitForLoading();
    await expect(this.page.getByText('User record activated', { exact: true })).toBeVisible();
    await this.expectRecord(user, id);
    log.info(`User record ${id} reactivated`);
  }

  async findAndOpen(
    user: NewUserDetails,
    id: number,
    status: 'Active' | 'Inactive' = 'Active',
  ): Promise<void> {
    log.debug(`Find the newly created user record ${id} by its unique email`);
    await this.openUserSearch();
    const form = this.page.locator('app-user-search-form');
    await form.getByLabel('Email', { exact: true }).fill(user.email);
    await form.getByRole('radio', { name: `${status} users`, exact: true }).check();
    await form.getByRole('button', { name: 'Search', exact: true }).click();
    const row = this.page
      .locator('#search-results')
      .getByRole('row')
      .filter({
        has: this.page.getByRole('cell', { name: user.email, exact: true }),
      });
    await expect(row).toHaveCount(1);
    await this.waitForLoading();
    await expect(row.getByRole('cell', { name: user.fullName, exact: true })).toBeVisible();
    await expect(row.getByRole('cell', { name: status, exact: true })).toBeVisible();
    await row.getByRole('link', { name: 'View', exact: true }).click();
    await this.waitForRecord(user, id);
  }

  async expectRecord(
    user: NewUserDetails,
    id: number,
    status: 'Active' | 'Inactive' = 'Active',
  ): Promise<void> {
    log.debug(`Verify saved details and ${status.toLowerCase()} status for user ${id}`);
    await this.waitForRecord(user, id);
    const record = this.page.locator('app-user-record');
    for (const value of [user.fullName, user.email, user.description]) {
      await expect(record.getByRole('definition').filter({ hasText: value })).toHaveText(value);
    }
    await expect(
      record.getByText(status === 'Active' ? 'Active user' : 'Inactive', { exact: true }),
    ).toBeVisible();
  }
}
