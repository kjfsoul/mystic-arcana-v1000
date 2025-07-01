import { test, expect } from '@playwright/test';

test.describe('Location Search', () => {
  test('should allow a user to search for and select a location', async ({ page }) => {
    await page.goto('/');

    // Click the "Birth Chart Reading" heading to reveal the location search
    const birthChartHeading = page.locator('h3:has-text("Birth Chart Reading")');
    await expect(birthChartHeading).toBeVisible();
    await birthChartHeading.click();

    // Wait for the location search input to be visible before interacting with it
    const locationSearchInput = page.locator('input[placeholder="Enter city, state, country, or ZIP code"]');
    await expect(locationSearchInput).toBeVisible();

    // Now, click the location search input
    await locationSearchInput.click();

    // Type a location
    await page.locator('input[placeholder="Enter city, state, country, or ZIP code"]').type('New York');

    // Click the first suggestion
    await page.locator('button:has-text("New York, NY, USA")').click();

    // Verify that the location is selected
    await expect(page.locator('div:has-text("New York, NY, USA")')).toBeVisible();
  });
});
