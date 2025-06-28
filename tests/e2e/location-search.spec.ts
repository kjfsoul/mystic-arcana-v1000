import { test, expect } from '@playwright/test';

test.describe('Location Search', () => {
  test('should allow a user to search for and select a location', async ({ page }) => {
    await page.goto('/');

    // Click the "Enter Astrology Cosmos" heading to navigate to the astrology room
    const astrologyCosmosHeading = page.locator('h2:has-text("Enter the Astrology Cosmos")');
    await expect(astrologyCosmosHeading).toBeVisible();
    await astrologyCosmosHeading.click();

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
