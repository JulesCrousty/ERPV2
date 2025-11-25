import { expect, test } from '@playwright/test';

test.describe('UI smoke (QA)', () => {
  test('Login and navigate to dashboard KPIs', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'qa');
    await page.fill('input[name="password"]', 'secret');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('Sidebar navigation shows analytics and workflow timeline', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Analytics');
    await expect(page.getByText('Total Sales')).toBeVisible();
    await page.click('text=Workflow');
    await expect(page.getByText('Timeline')).toBeVisible();
  });

  test('Dashboard loads KPIs', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Total Sales')).toBeVisible();
    await expect(page.getByText('Open POs')).toBeVisible();
  });

  test('Tables support sorting and modal confirmations', async ({ page }) => {
    await page.goto('/mm/purchase-orders');
    await page.getByRole('columnheader', { name: 'Number' }).click();
    await expect(page.getByRole('row').first()).toBeVisible();
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
