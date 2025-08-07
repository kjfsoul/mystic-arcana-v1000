import { test, expect, Page } from "@playwright/test";

test.describe("Tarot Reading Flow E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the tarot reading interface
    await page.goto("/tarot");
    await page.waitForLoadState("networkidle");
  });

  test("Complete guest user single card reading flow", async ({ page }) => {
    // Step 1: Verify initial load
    await expect(page.locator("h1")).toContainText("Mystic Arcana");
    await expect(page.locator('[data-testid="spread-selector"]')).toBeVisible();

    // Step 2: Select single card spread (available for guests)
    await page.locator('[data-testid="spread-single"]').click();
    await expect(page.locator('[data-testid="spread-single"]')).toHaveClass(
      /border-purple-400/,
    );

    // Step 3: Start reading
    await page.locator('[data-testid="begin-reading-btn"]').click();
    await expect(page.locator("text=Prepare Your Mind")).toBeVisible();

    // Step 4: Begin shuffling
    await page.locator('button:has-text("Begin Shuffling")').click();
    await expect(page.locator("text=Shuffling Cosmic Energies")).toBeVisible();

    // Step 5: Wait for shuffle animation to complete and card to be drawn
    await page.waitForSelector('[data-testid="tarot-card"]', {
      timeout: 10000,
    });
    await expect(page.locator('[data-testid="tarot-card"]')).toBeVisible();

    // Step 6: Click card to reveal meaning
    await page.locator('[data-testid="tarot-card"]').click();
    await expect(page.locator('[data-testid="card-meaning"]')).toBeVisible();

    // Step 7: Verify interpretation panel appears
    await expect(
      page.locator('[data-testid="interpretation-panel"]'),
    ).toBeVisible();
    await expect(page.locator("text=Core Meaning")).toBeVisible();

    // Step 8: Test tab navigation in interpretation panel
    await page.locator('button:has-text("Context")').click();
    await expect(page.locator("text=Spread Context")).toBeVisible();

    await page.locator('button:has-text("Guidance")').click();
    await expect(page.locator("text=Emotional Guidance")).toBeVisible();

    // Step 9: Verify guest save functionality
    await page.locator('button:has-text("Save Reading")').click();
    await expect(
      page.locator("text=As a guest, your reading will be saved locally"),
    ).toBeVisible();

    await page.locator('button:has-text("Save Reading")').click();
    await expect(page.locator("text=Reading saved successfully")).toBeVisible({
      timeout: 5000,
    });

    // Step 10: Start new reading
    await page.locator('button:has-text("New Reading")').click();
    await expect(page.locator("text=Choose Your Cosmic Reading")).toBeVisible();
  });

  test("Three-card reading requires authentication", async ({ page }) => {
    // Step 1: Select three-card spread
    await page.locator('[data-testid="spread-three-card"]').click();

    // Step 2: Verify lock overlay appears
    await expect(page.locator("text=Sign In Required")).toBeVisible();
    await expect(page.locator('[data-testid="crown-icon"]')).toBeVisible();

    // Step 3: Try to start reading - should show auth modal
    await page.locator('[data-testid="begin-reading-btn"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(
      page.locator("text=Sign in to unlock advanced spreads"),
    ).toBeVisible();
  });

  test("Celtic Cross spread with authenticated user", async ({ page }) => {
    // Step 1: Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem(
        "supabase.auth.token",
        JSON.stringify({
          access_token: "mock-token",
          user: { id: "test-user", email: "test@example.com" },
        }),
      );
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Step 2: Select Celtic Cross spread
    await page.locator('[data-testid="spread-celtic-cross"]').click();
    await expect(
      page.locator('[data-testid="spread-celtic-cross"]'),
    ).toHaveClass(/border-purple-400/);

    // Step 3: Verify no lock overlay
    await expect(page.locator("text=Sign In Required")).not.toBeVisible();

    // Step 4: Start reading
    await page.locator('[data-testid="begin-reading-btn"]').click();

    // Step 5: Complete shuffle
    await page.locator('button:has-text("Begin Shuffling")').click();

    // Step 6: Wait for all 10 cards to be drawn
    await page.waitForSelector('[data-testid="tarot-card"]', {
      timeout: 15000,
    });

    // Verify 10 cards are present
    const cardCount = await page.locator('[data-testid="tarot-card"]').count();
    expect(cardCount).toBe(10);

    // Step 7: Test card interaction
    await page.locator('[data-testid="tarot-card"]').first().click();
    await expect(
      page.locator('[data-testid="interpretation-panel"]'),
    ).toBeVisible();

    // Step 8: Navigate between cards
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator("text=2 of 10")).toBeVisible();

    await page.locator('button:has-text("Previous")').click();
    await expect(page.locator("text=1 of 10")).toBeVisible();

    // Step 9: Test position guide on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("text=Position Guide")).toBeVisible();

    // Verify position numbers are visible
    for (let i = 1; i <= 10; i++) {
      await expect(page.locator(`text=${i}`)).toBeVisible();
    }
  });

  test("Interpretation panel functionality", async ({ page }) => {
    // Complete a single card reading first
    await page.locator('[data-testid="spread-single"]').click();
    await page.locator('[data-testid="begin-reading-btn"]').click();
    await page.locator('button:has-text("Begin Shuffling")').click();

    await page.waitForSelector('[data-testid="tarot-card"]', {
      timeout: 10000,
    });
    await page.locator('[data-testid="tarot-card"]').click();

    // Wait for interpretation panel
    await expect(
      page.locator('[data-testid="interpretation-panel"]'),
    ).toBeVisible();

    // Test section expansion
    await page.locator('button:has-text("Emotional Guidance")').click();
    await expect(
      page.locator("text=This card invites you to explore"),
    ).toBeVisible();

    // Test bookmarking
    await page.locator('[data-testid="bookmark-btn"]').first().click();
    await expect(page.locator("text=1 bookmarked")).toBeVisible();

    // Test audio toggle
    await page.locator('[data-testid="audio-toggle"]').click();
    await expect(page.locator('[data-testid="audio-toggle"]')).toHaveClass(
      /bg-purple-600/,
    );

    // Test tab navigation
    const tabs = ["Meaning", "Context", "Guidance", "Connections"];

    for (const tab of tabs) {
      await page.locator(`button:has-text("${tab}")`).click();
      await expect(page.locator(`button:has-text("${tab}")`)).toHaveClass(
        /bg-purple-600/,
      );
    }

    // Test share functionality
    await page.locator('button:has-text("Share")').click();
    // Note: Actual share functionality would depend on implementation
  });

  test("Error handling and recovery", async ({ page }) => {
    // Mock API failure
    await page.route("/api/tarot/draw", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Server error" }),
      });
    });

    // Attempt reading
    await page.locator('[data-testid="spread-single"]').click();
    await page.locator('[data-testid="begin-reading-btn"]').click();
    await page.locator('button:has-text("Begin Shuffling")').click();

    // Verify error state
    await expect(
      page.locator("text=Cosmic Connection Disrupted"),
    ).toBeVisible();
    await expect(page.locator("text=Server error")).toBeVisible();

    // Test retry functionality
    await page.unroute("/api/tarot/draw");
    await page.locator('button:has-text("Try Again")').click();

    await expect(page.locator("text=Prepare Your Mind")).toBeVisible();
  });

  test("Keyboard navigation accessibility", async ({ page }) => {
    // Test keyboard navigation on spread selector
    await page.keyboard.press("Tab");
    await expect(page.locator('[data-testid="spread-single"]')).toBeFocused();

    // Navigate between spreads with arrow keys
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('[data-testid="spread-three-card"]')).toHaveClass(
      /border-purple-400/,
    );

    await page.keyboard.press("ArrowRight");
    await expect(
      page.locator('[data-testid="spread-celtic-cross"]'),
    ).toHaveClass(/border-purple-400/);

    // Go back to single card with arrow key
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator('[data-testid="spread-single"]')).toHaveClass(
      /border-purple-400/,
    );

    // Start reading with Enter key
    await page.keyboard.press("Enter");
    await expect(page.locator("text=Prepare Your Mind")).toBeVisible();
  });

  test("Mobile responsive behavior", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify mobile layout
    await expect(page.locator('[data-testid="spread-selector"]')).toHaveCSS(
      "grid-template-columns",
      "repeat(1, minmax(0, 1fr))",
    );

    // Complete reading flow on mobile
    await page.locator('[data-testid="spread-single"]').click();
    await page.locator('[data-testid="begin-reading-btn"]').click();
    await page.locator('button:has-text("Begin Shuffling")').click();

    await page.waitForSelector('[data-testid="tarot-card"]', {
      timeout: 10000,
    });

    // Verify mobile card size
    const card = page.locator('[data-testid="tarot-card"]');
    const cardBox = await card.boundingBox();
    expect(cardBox?.width).toBeLessThan(200); // Mobile cards should be smaller

    // Test touch interaction
    await card.tap();
    await expect(
      page.locator('[data-testid="interpretation-panel"]'),
    ).toBeVisible();

    // Verify mobile-specific UI elements
    await expect(page.locator('[data-testid="mobile-controls"]')).toBeVisible();
  });

  test("Performance and loading states", async ({ page }) => {
    // Measure initial load time
    const startTime = Date.now();
    await page.goto("/tarot");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

    // Test loading states during shuffle
    await page.locator('[data-testid="spread-single"]').click();
    await page.locator('[data-testid="begin-reading-btn"]').click();

    // Verify loading spinner appears
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    await page.locator('button:has-text("Begin Shuffling")').click();

    // Verify shuffle animation doesn't block UI
    const shuffleAnimation = page.locator('[data-testid="shuffle-animation"]');
    await expect(shuffleAnimation).toBeVisible();

    // Ensure animations complete within reasonable time
    await page.waitForSelector('[data-testid="tarot-card"]', {
      timeout: 10000,
    });
    await expect(shuffleAnimation).not.toBeVisible();
  });

  test("Data persistence for guest users", async ({ page }) => {
    // Complete a reading as guest
    await page.locator('[data-testid="spread-single"]').click();
    await page.locator('[data-testid="begin-reading-btn"]').click();
    await page.locator('button:has-text("Begin Shuffling")').click();

    await page.waitForSelector('[data-testid="tarot-card"]', {
      timeout: 10000,
    });
    await page.locator('[data-testid="tarot-card"]').click();

    // Save reading
    await page.locator('button:has-text("Save Reading")').click();
    await page.locator('button:has-text("Save Reading")').click(); // Confirm save

    // Verify localStorage contains the reading
    const localStorage = await page.evaluate(() => {
      return window.localStorage.getItem("guestReadings");
    });

    expect(localStorage).toBeTruthy();
    const readings = JSON.parse(localStorage!);
    expect(readings).toHaveLength(1);
    expect(readings[0]).toHaveProperty("id");
    expect(readings[0]).toHaveProperty("spreadType", "single");
    expect(readings[0]).toHaveProperty("cards");
    expect(readings[0]).toHaveProperty("timestamp");

    // Refresh page and verify data persists
    await page.reload();
    await page.waitForLoadState("networkidle");

    const persistedData = await page.evaluate(() => {
      return window.localStorage.getItem("guestReadings");
    });

    expect(persistedData).toEqual(localStorage);
  });
});
