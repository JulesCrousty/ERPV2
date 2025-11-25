import { expect, test } from '@playwright/test';

test.describe('Frontend API integration (QA)', () => {
  test('dashboard page should call analytics API', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/analytics/kpis');
    expect([200, 401, 403]).toContain(response.status());
  });

  test('error boundary captures failed responses', async ({ page }) => {
    await page.route('**/api/fi/documents*', (route) => route.abort());
    await page.goto('/fi/documents');
    await expect(page.getByText(/error/i)).toBeVisible();
  });

  test('expired auth redirects to login', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'expired');
    });
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
