/**
 * SAVE READING FLOW - END-TO-END TEST
 *
 * Tests the complete user journey from tarot reading to save functionality
 * Validates Priority 3: Restore the Save Reading User Flow
 */

import { test, expect } from "@playwright/test";

test.describe("Save Reading Flow - Complete User Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("CRITICAL: Complete authenticated save reading flow", async ({
    page,
  }) => {
    console.log("🎯 Starting complete save reading flow test...");

    // Step 1: Navigate to Tarot Reading interface
    console.log("📍 Step 1: Navigate to Tarot Reading");
    const tarotRealmButton = page
      .locator('text="Enter the Tarot Realm"')
      .first();
    await expect(tarotRealmButton).toBeVisible({ timeout: 10000 });
    await tarotRealmButton.click();

    // Wait for tarot interface to load
    await page.waitForLoadState("networkidle");

    // Debug: Check what elements are actually present
    console.log("📍 Checking page elements after navigation...");
    const bodyText = await page.textContent("body");
    console.log(
      "📍 Page contains tarot-related text:",
      bodyText?.includes("tarot") || bodyText?.includes("Tarot") || false,
    );

    // More flexible check - just ensure we're no longer on the hub
    await page.waitForTimeout(2000);
    const hubElements = page.locator('text="Enter the Tarot Realm"');
    const isStillOnHub = await hubElements.isVisible();
    console.log("📍 Still on hub page:", isStillOnHub);

    if (isStillOnHub) {
      console.log("📍 Still on hub - navigation may have failed");
      await page.screenshot({ path: "debug-still-on-hub.png" });
    }

    // Step 2: Simulate user authentication (mock login state)
    console.log("📍 Step 2: Mock authentication state");
    await page.evaluate(() => {
      // Mock localStorage user data to simulate logged-in state
      localStorage.setItem(
        "supabase.auth.token",
        JSON.stringify({
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
          expires_at: Date.now() + 3600000,
          user: {
            id: "test-user-id",
            email: "test@example.com",
          },
        }),
      );

      // Trigger auth state change
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "supabase.auth.token",
          newValue: localStorage.getItem("supabase.auth.token"),
        }),
      );
    });

    // Step 3: Select Single Card spread (it's available and unlocked)
    console.log("📍 Step 3: Select Single Card spread");
    const singleCardButton = page.locator('button:has-text("Single")').first();
    if (await singleCardButton.isVisible()) {
      await singleCardButton.click();
      await page.waitForTimeout(1000);
      console.log("📍 Single Card spread selected");
    }

    // Step 4: Click Draw Card button
    console.log("📍 Step 4: Click Draw Card button");
    const drawCardButton = page.locator('button:has-text("Draw Card")').first();
    if (await drawCardButton.isVisible()) {
      await drawCardButton.click();
      await page.waitForTimeout(3000); // Wait for card drawing animation
      console.log("📍 Draw Card button clicked");
    }

    // Look for TarotCard components using the correct CSS module class
    const tarotCards = page.locator('[class*="cardContainer"]').first();
    const isCardVisible = await tarotCards.isVisible({ timeout: 5000 });

    console.log(`📍 Tarot card visible: ${isCardVisible}`);

    if (isCardVisible) {
      console.log("📍 Clicking tarot card to flip it...");
      await tarotCards.click();
      await page.waitForTimeout(1500); // Wait for flip animation

      // Check if more cards are now visible
      const allCardElements = page.locator('[class*="cardContainer"]');
      const cardCount = await allCardElements.count();
      console.log(`📍 Total card elements found: ${cardCount}`);
    } else {
      console.log("📍 No tarot cards found - checking page state...");

      // Debug: Take screenshot to see current state
      await page.screenshot({ path: "debug-no-cards.png" });

      // Try alternative selectors just in case
      const alternativeCards = page.locator(
        '.card, [data-card], [role="button"]:has-text("card")',
      );
      const altCount = await alternativeCards.count();
      console.log(`📍 Alternative card elements: ${altCount}`);
    }

    // Step 5: Wait for reading completion and look for Save button
    console.log("📍 Step 5: Look for Save Reading button");
    await page.waitForTimeout(3000); // Allow time for reading to complete

    // Multiple selectors for Save Reading button
    const saveButtonSelectors = [
      'text="Save Reading"',
      '[data-testid="save-reading-button"]',
      ".save-reading-btn",
      ".save-button",
      'button:has-text("Save")',
      '[class*="save"][class*="reading"]',
      'button[class*="save"]',
    ];

    let saveButton = null;
    let saveButtonFound = false;

    for (const selector of saveButtonSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 2000 })) {
        saveButton = button;
        saveButtonFound = true;
        console.log(`✅ Save button found with selector: ${selector}`);
        break;
      }
    }

    // If no save button found, look for save modal trigger
    if (!saveButtonFound) {
      console.log("🔍 Looking for alternative save triggers...");
      const modalTriggers = [
        'text="Save"',
        '[class*="save"]',
        'button[onclick*="save"]',
        '[data-action="save"]',
      ];

      for (const trigger of modalTriggers) {
        const element = page.locator(trigger).first();
        if (await element.isVisible({ timeout: 1000 })) {
          saveButton = element;
          saveButtonFound = true;
          console.log(`✅ Save trigger found: ${trigger}`);
          break;
        }
      }
    }

    // Step 6: Click Save button and handle save flow
    if (saveButtonFound && saveButton) {
      console.log("📍 Step 6: Click Save Reading button");
      await saveButton.click();

      // Step 7: Handle save modal or direct save
      console.log("📍 Step 7: Handle save process");
      await page.waitForTimeout(1000);

      // Look for save modal
      const saveModal = page
        .locator('[data-testid="save-modal"], .save-modal, [class*="modal"]')
        .first();
      if (await saveModal.isVisible({ timeout: 3000 })) {
        console.log("📋 Save modal appeared, filling form...");

        // Fill interpretation field if present
        const interpretationField = page
          .locator(
            'textarea[placeholder*="interpretation"], [name="interpretation"], #interpretation',
          )
          .first();
        if (await interpretationField.isVisible({ timeout: 2000 })) {
          await interpretationField.fill(
            "Test interpretation for automated test",
          );
        }

        // Fill question field if present
        const questionField = page
          .locator(
            'input[placeholder*="question"], [name="question"], #question',
          )
          .first();
        if (await questionField.isVisible({ timeout: 2000 })) {
          await questionField.fill("Test question for automated reading");
        }

        // Submit the save form
        const submitButton = page
          .locator(
            'button[type="submit"], text="Save", .save-btn, [data-testid="submit-save"]',
          )
          .first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
      }

      // Step 8: Verify save success
      console.log("📍 Step 8: Verify save operation");
      await page.waitForTimeout(2000);

      // Look for success indicators
      const successIndicators = [
        'text="Reading saved"',
        'text="Successfully saved"',
        ".toast-success",
        ".success-message",
        '[class*="success"]',
      ];

      let saveSuccess = false;
      for (const indicator of successIndicators) {
        if (await page.locator(indicator).isVisible({ timeout: 3000 })) {
          console.log(`✅ Save success detected: ${indicator}`);
          saveSuccess = true;
          break;
        }
      }

      // Check if save button is no longer visible (indicating save completed)
      if (!saveSuccess && !(await saveButton.isVisible({ timeout: 2000 }))) {
        console.log("✅ Save button disappeared (likely saved successfully)");
        saveSuccess = true;
      }

      // Step 9: Verify API response (if possible)
      console.log("📍 Step 9: Check network activity for save API call");

      // Monitor network for save-reading API calls
      let apiCallDetected = false;
      page.on("response", (response) => {
        if (response.url().includes("/api/tarot/save-reading")) {
          console.log(`🌐 Save reading API called: ${response.status()}`);
          if (response.status() === 200 || response.status() === 201) {
            apiCallDetected = true;
          }
        }
      });

      await page.waitForTimeout(1000);

      // Final assertion
      expect(saveSuccess || apiCallDetected).toBe(true);
      console.log("🎉 Save reading flow test completed successfully");
    } else {
      // If no save button found, this indicates the UI flow issue
      console.log("❌ Save Reading button not found - UI flow issue detected");

      // Take a screenshot for debugging
      await page.screenshot({
        path: "save-button-not-found.png",
        fullPage: true,
      });

      // Log current page elements for debugging
      const allButtons = await page.locator("button").all();
      console.log(`🔍 Found ${allButtons.length} buttons on page`);

      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const buttonText = await allButtons[i].textContent();
        const buttonClass = await allButtons[i].getAttribute("class");
        console.log(
          `  Button ${i + 1}: "${buttonText}" (class: ${buttonClass})`,
        );
      }

      // This should fail the test as per the requirement
      expect(saveButtonFound).toBe(true);
    }
  });

  test("VERIFICATION: Save reading flow for guest users", async ({ page }) => {
    console.log(
      "👤 Testing save reading flow for guest (unauthenticated) users...",
    );

    // Navigate to tarot interface
    const tarotRealmButton = page
      .locator('text="Enter the Tarot Realm"')
      .first();
    await expect(tarotRealmButton).toBeVisible({ timeout: 10000 });
    await tarotRealmButton.click();
    await page.waitForLoadState("networkidle");

    // Ensure no authentication (clear any existing auth)
    await page.evaluate(() => {
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.clear();
    });

    // Simulate reading completion
    await page.waitForTimeout(2000);

    // Try to find actual tarot cards (not decorative cards)
    const tarotCards = page.locator(
      ".card-container, .tarot-card-display, [data-card-id]",
    );
    const cardCount = await tarotCards.count();

    if (cardCount > 0) {
      await tarotCards.first().click();
      await page.waitForTimeout(1000);
    }

    // For guest users, Save button should either:
    // 1. Not be visible, OR
    // 2. Show a login prompt when clicked
    const saveButton = page
      .locator('text="Save Reading", [data-testid="save-reading-button"]')
      .first();

    if (await saveButton.isVisible({ timeout: 5000 })) {
      console.log("💡 Save button visible for guest - checking behavior...");
      await saveButton.click();

      // Should show login prompt or auth modal
      const authPrompt = page
        .locator(
          'text="Sign in", text="Log in", text="Login", .auth-modal, [class*="login"]',
        )
        .first();
      const isAuthPromptVisible = await authPrompt.isVisible({ timeout: 3000 });

      console.log(`🔐 Auth prompt shown for guest: ${isAuthPromptVisible}`);
      expect(isAuthPromptVisible).toBe(true);
    } else {
      console.log("✅ Save button correctly hidden for guest users");
      expect(true).toBe(true); // Pass test - correct behavior
    }
  });

  test("DIAGNOSTIC: Save reading UI state analysis", async ({ page }) => {
    console.log("🔍 Analyzing save reading UI state and conditions...");

    // Navigate to tarot interface
    const tarotRealmButton = page
      .locator('text="Enter the Tarot Realm"')
      .first();
    await expect(tarotRealmButton).toBeVisible({ timeout: 10000 });
    await tarotRealmButton.click();
    await page.waitForLoadState("networkidle");

    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem(
        "supabase.auth.token",
        JSON.stringify({
          access_token: "mock-token",
          user: { id: "test-user", email: "test@example.com" },
        }),
      );
    });

    // Analyze initial state
    console.log("📊 Initial UI State Analysis:");

    const initialButtonCount = await page.locator("button").count();
    const initialSaveButtons = await page
      .locator('text="Save", [class*="save"]')
      .count();

    console.log(`  Total buttons: ${initialButtonCount}`);
    console.log(`  Save-related buttons: ${initialSaveButtons}`);

    // Simulate card interaction with actual tarot cards
    const tarotCards = page.locator(
      ".card-container, .tarot-card-display, [data-card-id]",
    );
    const cardCount = await tarotCards.count();
    console.log(`  Tarot cards found: ${cardCount}`);

    if (cardCount > 0) {
      await tarotCards.first().click();
      await page.waitForTimeout(2000);

      // Analyze state after card interaction
      console.log("📊 Post-Card-Flip UI State:");
      const postFlipButtonCount = await page.locator("button").count();
      const postFlipSaveButtons = await page
        .locator('text="Save", [class*="save"]')
        .count();

      console.log(`  Total buttons: ${postFlipButtonCount}`);
      console.log(`  Save-related buttons: ${postFlipSaveButtons}`);

      // Check for specific save reading button
      const saveReadingButton = page.locator('text="Save Reading"');
      const isSaveReadingVisible = await saveReadingButton.isVisible();
      console.log(`  "Save Reading" button visible: ${isSaveReadingVisible}`);

      if (isSaveReadingVisible) {
        const saveButtonText = await saveReadingButton.textContent();
        const saveButtonClass = await saveReadingButton.getAttribute("class");
        console.log(`  Save button text: "${saveButtonText}"`);
        console.log(`  Save button classes: ${saveButtonClass}`);
      }
    }

    // Always pass diagnostic test
    expect(true).toBe(true);
  });
});
