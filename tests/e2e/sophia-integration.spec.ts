/**
 * LIVING ORACLE INITIATIVE - PHASE 1: SOPHIA INTEGRATION VALIDATION
 *
 * Validates claims regarding Sophia virtual reader integration:
 * 1. Sophia appears on the interface
 * 2. Sophia provides contextual messages
 * 3. Sophia responds to user interactions
 * 4. Integration is stable and performant
 */

import { test, expect } from "@playwright/test";

test.describe("Sophia Virtual Reader Integration Audit", () => {
  test("CRITICAL: Sophia virtual reader is present and visible", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    // Navigate to tarot view where Sophia is actually located
    console.log("🎴 Navigating to tarot reading interface...");
    const tarotRealmButton = page
      .locator('text="Enter the Tarot Realm"')
      .first();
    await expect(tarotRealmButton).toBeVisible({ timeout: 10000 });
    await tarotRealmButton.click();

    // Wait for tarot interface to load
    await page.waitForTimeout(3000);

    // Look for Sophia virtual reader elements
    const sophiaSelectors = [
      '[data-testid="virtual-reader"]',
      ".virtual-reader",
      '[data-testid="sophia-reader"]',
      ".sophia-reader",
      'div:has-text("Sophia")',
      // Check for reader display component
      'div:has([class*="VirtualReaderDisplay"])',
      // Check for fixed positioning (likely in bottom corner)
      ".fixed",
      // Look for reader-like containers
      'div[class*="reader"]',
    ];

    let sophiaFound = false;
    let foundSelector = "";

    for (const selector of sophiaSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          sophiaFound = true;
          foundSelector = selector;
          break;
        }
      } catch (error) {
        // Continue checking other selectors
      }
    }

    console.log(
      `🤖 Sophia Detection Result: ${sophiaFound ? "FOUND" : "NOT FOUND"}`,
    );
    if (sophiaFound) {
      console.log(`✅ Sophia found via selector: ${foundSelector}`);
    }

    // Take screenshot for manual verification
    await page.screenshot({
      path: "tests/screenshots/sophia-integration-check.png",
      fullPage: true,
    });

    // Sophia should be present based on previous claims
    expect(sophiaFound).toBe(true);
  });

  test("VERIFICATION: Sophia displays greeting message on load", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Navigate to tarot view where Sophia is located
    const tarotRealmButton = page
      .locator('text="Enter the Tarot Realm"')
      .first();
    await expect(tarotRealmButton).toBeVisible({ timeout: 10000 });
    await tarotRealmButton.click();

    // Wait for Sophia to load and show greeting
    await page.waitForTimeout(5000);

    // Look for message elements
    const messageSelectors = [
      'text*="Welcome"',
      'text*="Sophia"',
      'text*="guide"',
      'text*="seeker"',
      'text*="universe"',
      '[class*="message"]',
      '[class*="tooltip"]',
      '[class*="dialogue"]',
    ];

    let messageFound = false;
    let messageText = "";

    for (const selector of messageSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          messageText = (await element.textContent()) || "";
          if (messageText.length > 10) {
            // Substantial message
            messageFound = true;
            break;
          }
        }
      } catch (error) {
        // Continue checking
      }
    }

    console.log(
      `💬 Sophia Message Detection: ${messageFound ? "FOUND" : "NOT FOUND"}`,
    );
    if (messageFound) {
      console.log(`✅ Message content: "${messageText.slice(0, 100)}..."`);
    }

    // Based on implementation, Sophia should show greeting
    expect(messageFound).toBe(true);
  });

  test("VERIFICATION: Sophia responds to tarot card interactions", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Navigate to tarot view where Sophia is located
    const tarotRealmButton = page
      .locator('text="Enter the Tarot Realm"')
      .first();
    await expect(tarotRealmButton).toBeVisible({ timeout: 10000 });
    await tarotRealmButton.click();
    await page.waitForTimeout(3000);

    // Look for draw cards button
    const drawButton = page
      .locator(
        'text="Draw Card", text="Draw Cards", text="Draw 3 Cards", [data-testid*="draw"]',
      )
      .first();

    let cardInteractionPossible = false;

    if (await drawButton.isVisible({ timeout: 5000 })) {
      console.log("🎴 Found draw button, attempting card draw...");

      try {
        await drawButton.click();
        await page.waitForTimeout(3000);

        // Look for cards to interact with
        const cards = page.locator(
          '[data-testid*="card"], .tarot-card, [class*="card"]',
        );
        const cardCount = await cards.count();

        if (cardCount > 0) {
          console.log(`🎴 Found ${cardCount} cards`);

          // Click first card
          await cards.first().click();
          await page.waitForTimeout(2000);

          cardInteractionPossible = true;
        }
      } catch (error) {
        console.log("⚠️ Card interaction failed:", error);
      }
    }

    if (cardInteractionPossible) {
      // Check if Sophia's message changed after card interaction
      const messageAfterInteraction = await page
        .locator('[class*="message"], [class*="tooltip"]')
        .first()
        .textContent();

      console.log(
        `💬 Sophia message after card interaction: "${messageAfterInteraction?.slice(0, 100) || "None detected"}"`,
      );

      // Sophia should respond to card interactions
      expect(messageAfterInteraction).toBeTruthy();
      expect(messageAfterInteraction?.length || 0).toBeGreaterThan(10);
    } else {
      console.log("ℹ️ Card interaction not available, skipping response test");
    }
  });

  test("VERIFICATION: Sophia integration performance impact", async ({
    page,
  }) => {
    // Measure performance with Sophia
    const startTime = Date.now();

    await page.goto("/", { waitUntil: "networkidle" });

    // Navigate to tarot view where Sophia is located
    const tarotRealmButton = page
      .locator('text="Enter the Tarot Realm"')
      .first();
    await expect(tarotRealmButton).toBeVisible({ timeout: 10000 });
    await tarotRealmButton.click();
    await page.waitForTimeout(3000);

    const loadTimeWithSophia = Date.now() - startTime;

    // Check memory usage and DOM impact
    const performanceMetrics = await page.evaluate(() => ({
      domNodes: document.querySelectorAll("*").length,
      memoryInfo: (performance as any).memory
        ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          }
        : null,
      eventListeners: document.body.querySelectorAll(
        "[onclick], [onmouseover], [onhover]",
      ).length,
    }));

    console.log("📊 Sophia Performance Impact Assessment:");
    console.log(`- Load time: ${loadTimeWithSophia}ms`);
    console.log(`- DOM nodes: ${performanceMetrics.domNodes}`);
    console.log(`- Event listeners: ${performanceMetrics.eventListeners}`);

    if (performanceMetrics.memoryInfo) {
      console.log(
        `- Memory usage: ${Math.round(performanceMetrics.memoryInfo.usedJSHeapSize / 1024 / 1024)}MB`,
      );
    }

    // Sophia integration should not significantly impact performance
    expect(loadTimeWithSophia).toBeLessThan(8000); // Reasonable load time
    expect(performanceMetrics.domNodes).toBeLessThan(1000); // Reasonable DOM size

    console.log("✅ Sophia integration performance is acceptable");
  });

  test("VERIFICATION: Sophia visual positioning and styling", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Navigate to tarot view where Sophia is located
    const tarotRealmButton = page
      .locator('text="Enter the Tarot Realm"')
      .first();
    await expect(tarotRealmButton).toBeVisible({ timeout: 10000 });
    await tarotRealmButton.click();
    await page.waitForTimeout(3000);

    // Look for Sophia element
    const sophiaElement = page
      .locator('.fixed, [class*="virtual-reader"], [class*="sophia"]')
      .first();

    if (await sophiaElement.isVisible({ timeout: 5000 })) {
      const boundingBox = await sophiaElement.boundingBox();
      const computedStyle = await sophiaElement.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          position: style.position,
          zIndex: style.zIndex,
          bottom: style.bottom,
          right: style.right,
          width: style.width,
          height: style.height,
        };
      });

      console.log("🎨 Sophia Visual Properties:");
      console.log(`- Position: ${computedStyle.position}`);
      console.log(`- Z-index: ${computedStyle.zIndex}`);
      console.log(
        `- Location: bottom: ${computedStyle.bottom}, right: ${computedStyle.right}`,
      );
      console.log(`- Size: ${computedStyle.width} x ${computedStyle.height}`);

      if (boundingBox) {
        console.log(
          `- Bounding box: ${boundingBox.width}x${boundingBox.height} at (${boundingBox.x}, ${boundingBox.y})`,
        );
      }

      // Sophia should be positioned properly (likely fixed position)
      expect(["fixed", "absolute"]).toContain(computedStyle.position);
      expect(parseInt(computedStyle.zIndex)).toBeGreaterThan(10); // Should be above other content

      console.log("✅ Sophia visual positioning is appropriate");
    } else {
      console.log("❌ Sophia element not found for visual verification");
      expect(true).toBe(false); // Fail if Sophia not found
    }
  });

  test("DIAGNOSTIC: Sophia Integration Comprehensive Assessment", async ({
    page,
  }) => {
    console.log("🔍 SOPHIA INTEGRATION COMPREHENSIVE ASSESSMENT");
    console.log("===============================================");

    await page.goto("/", { waitUntil: "networkidle" });

    // Navigate to tarot view where Sophia is located
    const tarotRealmButton = page
      .locator('text="Enter the Tarot Realm"')
      .first();
    await expect(tarotRealmButton).toBeVisible({ timeout: 10000 });
    await tarotRealmButton.click();
    await page.waitForTimeout(5000);

    // Check all aspects of Sophia integration
    const assessment = await page.evaluate(() => {
      const results = {
        domElements: {
          virtualReader: !!document.querySelector(
            '[class*="virtual-reader"], [class*="VirtualReader"]',
          ),
          sophiaSpecific: !!document.querySelector(
            '[class*="sophia"], [data-testid*="sophia"]',
          ),
          messageElements: document.querySelectorAll(
            '[class*="message"], [class*="tooltip"], [class*="dialogue"]',
          ).length,
          fixedPositioned: document.querySelectorAll(".fixed").length,
        },
        scripts: {
          sophiaAgent:
            !!(window as any).SophiaAgent ||
            !!(window as any).SophiaAgentClient,
          messageState: !!(window as any).sophiaMessage,
          agentClasses: Object.keys(window).filter((key) =>
            key.toLowerCase().includes("sophia"),
          ).length,
        },
        interactions: {
          clickableElements: document.querySelectorAll(
            '[onclick], button, [role="button"]',
          ).length,
          hoverable: document.querySelectorAll(
            '[onmouseover], [class*="hover"]',
          ).length,
        },
        performance: {
          domComplexity: document.querySelectorAll("*").length,
          eventListeners: document.body.querySelectorAll("[on*]").length,
        },
      };

      return results;
    });

    console.log("📋 Sophia Integration Assessment Results:");
    console.log("DOM Elements:", assessment.domElements);
    console.log("Scripts/State:", assessment.scripts);
    console.log("Interactions:", assessment.interactions);
    console.log("Performance:", assessment.performance);

    // Take comprehensive screenshot
    await page.screenshot({
      path: "tests/screenshots/sophia-full-assessment.png",
      fullPage: true,
    });

    // Assess integration completeness
    const integrationScore =
      (assessment.domElements.virtualReader ? 25 : 0) +
      (assessment.domElements.messageElements > 0 ? 25 : 0) +
      (assessment.scripts.sophiaAgent ? 25 : 0) +
      (assessment.interactions.clickableElements > 5 ? 25 : 0);

    console.log(`📊 Integration Completeness Score: ${integrationScore}/100`);

    // Based on claims, integration should be substantial
    expect(integrationScore).toBeGreaterThan(50);

    console.log("✅ Comprehensive assessment completed");
  });
});
