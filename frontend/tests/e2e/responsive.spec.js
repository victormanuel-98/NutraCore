import { expect, test } from '@playwright/test';
import { mockCatalogSuccess } from './support/mockApi';

test('register form is usable without horizontal overflow', async ({ page }) => {
  await page.goto('/register', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('#confirmPassword')).toBeVisible();
  await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test('catalog keeps recipe cards visible across breakpoints', async ({ page }) => {
  await mockCatalogSuccess(page);
  await page.goto('/catalog', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('h1').first()).toBeVisible();
  await expect(page.getByText('Batido Proteico Tropical')).toBeVisible();
  await expect(page.getByRole('button', { name: /ver receta/i })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test('mobile navigation exposes the main routes on small screens', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Solo aplica a breakpoints moviles.');

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /abrir men/i }).click();

  const mobileMenu = page.locator('.mobile-menu-animate');
  await expect(mobileMenu.locator('a[href="/catalog"]')).toBeVisible();
  await expect(mobileMenu.locator('a[href="/news"]')).toBeVisible();
  await expect(mobileMenu.getByRole('link', { name: /iniciar sesi/i })).toBeVisible();
});
