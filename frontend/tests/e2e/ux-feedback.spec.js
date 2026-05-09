import { expect, test } from '@playwright/test';
import { mockLoginAndDashboard } from './support/mockApi';

test('login shows a loading state and blocks duplicate submission until completion', async ({ page }) => {
  await mockLoginAndDashboard(page, { delayMs: 900 });
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  await page.locator('#email').fill('qa-user@example.com');
  await page.locator('#password').fill('Password1!');

  const submitButton = page.locator('form button[type="submit"]');
  await submitButton.click();

  await expect(page.getByRole('button', { name: /accediendo/i })).toBeDisabled();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/actividad reciente/i)).toBeVisible();
});

test('catalog shows a friendly connection error when the API is unreachable', async ({ page }) => {
  await page.route('**/api/recipes**', async (route) => {
    await route.abort('failed');
  });

  await page.goto('/catalog', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText(/no se pudo conectar con el servidor/i)).toBeVisible();
});
