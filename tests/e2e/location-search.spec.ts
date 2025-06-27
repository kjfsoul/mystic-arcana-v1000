import { test, expect } from '@playwright/test';

test.describe('Location Search', () => {
  test('should allow a user to search for and select a location', async ({ page }) => {
    await page.goto('/');

    // Click the location search input
    await page.locator('input[placeholder="Enter city, state, country, or ZIP code"]').click();

    // Type a location
    await page.locator('input[placeholder="Enter city, state, country, or ZIP code"]').type('New York');

    // Click the first suggestion
    await page.locator('button:has-text("New York, NY, USA")').click();

    // Verify that the location is selected
    await expect(page.locator('div:has-text("New York, NY, USA")')).toBeVisible();
  });
});
