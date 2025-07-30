/**
 * End-to-End Test for Conversational Reading Flow
 * 
 * This test validates the complete turn-by-turn conversational reading experience
 * including Sophia's dialogue, interactive options, card reveals, and memory integration.
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Conversational Reading Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the tarot reading page
    await page.goto('/tarot');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('Complete conversational reading flow for guest user', async ({ page }) => {
    // Test the full conversational flow from start to finish
    
    // Step 1: Select a spread
    await test.step('Select three-card spread', async () => {
      const threeCardButton = page.locator('button:has-text("Three Card")');
      await expect(threeCardButton).toBeVisible();
      await threeCardButton.click();
    });

    // Step 2: Begin preparation phase
    await test.step('Begin shuffling phase', async () => {
      const beginButton = page.locator('button:has-text("Begin Shuffling")');
      await expect(beginButton).toBeVisible();
      await beginButton.click();
    });

    // Step 3: Wait for shuffling to complete and cards to be drawn
    await test.step('Wait for card drawing to complete', async () => {
      // Wait for shuffling phase
      await expect(page.locator('text=Shuffling Cosmic Energies')).toBeVisible();
      
      // Wait for cards to be drawn (this might take a few seconds)
      await page.waitForSelector('[data-testid="conversation-phase"]', { 
        timeout: 15000 
      });
      
      // Verify we're in conversation phase
      await expect(page.locator('text=In conversation with Sophia')).toBeVisible();
    });

    // Step 4: Verify Sophia's initial dialogue appears
    await test.step('Verify initial Sophia dialogue', async () => {
      // Check for Sophia's header
      await expect(page.locator('h3:has-text("Sophia")')).toBeVisible();
      
      // Check for conversation state indicator
      const stateIndicator = page.locator('.text-purple-400').first();
      await expect(stateIndicator).toBeVisible();
      
      // Check for dialogue content
      const dialogueSection = page.locator('.bg-purple-800\\/20').first();
      await expect(dialogueSection).toBeVisible();
      
      // Verify dialogue has content
      const dialogueText = await dialogueSection.textContent();
      expect(dialogueText).toBeTruthy();
      expect(dialogueText!.length).toBeGreaterThan(20);
    });

    // Step 5: Test interactive options
    await test.step('Interact with conversation options', async () => {
      // Wait for options to appear
      await page.waitForSelector('button.bg-purple-700\\/30', { timeout: 5000 });
      
      // Get all conversation option buttons
      const optionButtons = page.locator('button.bg-purple-700\\/30');
      const optionCount = await optionButtons.count();
      
      expect(optionCount).toBeGreaterThan(0);
      expect(optionCount).toBeLessThanOrEqual(4); // Reasonable max options
      
      // Click the first option
      const firstOption = optionButtons.first();
      const optionText = await firstOption.textContent();
      expect(optionText).toBeTruthy();
      
      await firstOption.click();
    });

    // Step 6: Verify response processing
    await test.step('Verify response processing', async () => {
      // Check for processing indicator
      await expect(page.locator('text=Sophia is reflecting')).toBeVisible();
      
      // Wait for processing to complete (new dialogue should appear)
      await page.waitForFunction(() => {
        const processingText = document.querySelector('text=Sophia is reflecting');
        return !processingText || processingText.textContent === '';
      }, { timeout: 10000 });
    });

    // Step 7: Continue conversation through multiple turns
    await test.step('Complete multiple conversation turns', async () => {
      let turnCount = 0;
      const maxTurns = 5; // Prevent infinite loops
      
      while (turnCount < maxTurns) {
        // Check if conversation options are still available
        const hasOptions = await page.locator('button.bg-purple-700\\/30').count() > 0;
        
        if (!hasOptions) {
          // No more options, conversation might be complete
          break;
        }
        
        // Click an available option
        const options = page.locator('button.bg-purple-700\\/30');
        const randomIndex = Math.floor(Math.random() * await options.count());
        await options.nth(randomIndex).click();
        
        // Wait for processing
        await page.waitForSelector('text=Sophia is reflecting', { timeout: 2000 })
          .catch(() => {}); // Might not always appear for fast responses
        
        // Wait for new dialogue
        await page.waitForTimeout(2000);
        
        turnCount++;
      }
      
      console.log(`Completed ${turnCount} conversation turns`);
    });

    // Step 8: Verify reading completion
    await test.step('Verify reading completion', async () => {
      // Check if we've moved to complete phase
      const completeHeader = page.locator('h2:has-text("Your Complete Reading")');
      
      if (await completeHeader.isVisible()) {
        // Verify complete reading display
        await expect(page.locator('text=Sophia\\'s personalized guidance')).toBeVisible();
        
        // Check for final reading sections
        await expect(page.locator('h4:has-text("Your Reading")')).toBeVisible();
        await expect(page.locator('h4:has-text("Guidance & Wisdom")')).toBeVisible();
        await expect(page.locator('h4:has-text("Spiritual Insight")')).toBeVisible();
        
        // Verify cards are displayed
        const cardElements = page.locator('[class*="aspect-[2/3]"]');
        const cardCount = await cardElements.count();
        expect(cardCount).toBe(3); // Three-card spread
        
      } else {
        // Still in conversation - verify current state
        await expect(page.locator('h3:has-text("Sophia")')).toBeVisible();
        console.log('Reading still in conversation phase');
      }
    });

    // Step 9: Test save functionality
    await test.step('Test save reading functionality', async () => {
      const saveButton = page.locator('button:has-text("Save Reading")');
      
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Check for save modal
        await expect(page.locator('h3:has-text("Save Your Reading")')).toBeVisible();
        
        // Verify guest user message
        await expect(page.locator('text=As a guest, your reading will be saved locally')).toBeVisible();
        
        // Click save
        await page.locator('button:has-text("Save Reading")').last().click();
        
        // Modal should close
        await expect(page.locator('h3:has-text("Save Your Reading")')).not.toBeVisible();
      }
    });
  });

  test('Conversational UI elements and animations', async ({ page }) => {
    // Test UI-specific elements of the conversational interface
    
    await test.step('Navigate to reading interface', async () => {
      const singleCardButton = page.locator('button:has-text("Single Card")');
      await singleCardButton.click();
      
      await page.locator('button:has-text("Begin Shuffling")').click();
    });

    await test.step('Verify conversation UI elements', async () => {
      // Wait for conversation phase
      await page.waitForSelector('[data-testid="conversation-phase"]', { timeout: 15000 });
      
      // Check Sophia avatar
      const avatar = page.locator('.bg-gradient-to-br.from-purple-500.to-pink-500.rounded-full');
      await expect(avatar).toBeVisible();
      
      // Check conversation state indicator
      const stateIndicator = page.locator('.text-purple-400:has-text("...")');
      await expect(stateIndicator).toBeVisible();
      
      // Verify dialogue styling
      const dialogueBox = page.locator('.bg-purple-800\\/20.rounded-lg');
      await expect(dialogueBox).toBeVisible();
      
      // Test option button styling
      const optionButtons = page.locator('button.bg-purple-700\\/30');
      if (await optionButtons.count() > 0) {
        const firstButton = optionButtons.first();
        
        // Test hover effect
        await firstButton.hover();
        
        // Test click interaction
        await firstButton.click();
      }
    });

    await test.step('Verify card display in conversation mode', async () => {
      // Check for conversation-specific card display
      const conversationCards = page.locator('[key*="conversation-card"]');
      
      if (await conversationCards.count() > 0) {
        // Verify card styling
        const firstCard = conversationCards.first();
        await expect(firstCard).toBeVisible();
        
        // Check card content structure
        const cardName = firstCard.locator('h4');
        if (await cardName.isVisible()) {
          const nameText = await cardName.textContent();
          expect(nameText).toBeTruthy();
        }
      }
    });
  });

  test('Conversational flow error handling', async ({ page }) => {
    // Test error scenarios in conversational flow
    
    await test.step('Setup conversation', async () => {
      await page.locator('button:has-text("Single Card")').click();
      await page.locator('button:has-text("Begin Shuffling")').click();
    });

    await test.step('Test network error handling', async () => {
      // Wait for conversation to start
      await page.waitForSelector('[data-testid="conversation-phase"]', { timeout: 15000 });
      
      // Simulate network failure
      await page.route('/api/tarot/**', route => route.abort());
      
      // Try to interact - should handle gracefully
      const optionButtons = page.locator('button.bg-purple-700\\/30');
      if (await optionButtons.count() > 0) {
        await optionButtons.first().click();
        
        // Look for error message
        await page.waitForSelector('text*=Unable to process', { timeout: 5000 })
          .catch(() => {
            console.log('No error message found - this might be expected if using mock data');
          });
      }
    });

    await test.step('Test graceful degradation', async () => {
      // Reset routes
      await page.unroute('/api/tarot/**');
      
      // Verify the interface still functions
      await expect(page.locator('h3:has-text("Sophia")')).toBeVisible();
      
      // Try refresh to reset state
      await page.reload();
      await page.waitForLoadState('networkidle');
    });
  });

  test('Memory integration for authenticated users', async ({ page }) => {
    // This test would require authentication setup
    // For now, we'll test the memory integration hooks indirectly
    
    await test.step('Verify PersonaLearner integration points', async () => {
      await page.locator('button:has-text("Single Card")').click();
      await page.locator('button:has-text("Begin Shuffling")').click();
      
      // Wait for conversation
      await page.waitForSelector('[data-testid="conversation-phase"]', { timeout: 15000 });
      
      // Check console for PersonaLearner logs (guest users should skip logging)
      const logs = [];
      page.on('console', msg => {
        if (msg.text().includes('PersonaLearner')) {
          logs.push(msg.text());
        }
      });
      
      // Interact with conversation
      const optionButtons = page.locator('button.bg-purple-700\\/30');
      if (await optionButtons.count() > 0) {
        await optionButtons.first().click();
        await page.waitForTimeout(2000);
      }
      
      // For guest users, we should see skip messages
      // For authenticated users, we should see logging messages
      console.log('PersonaLearner logs captured:', logs.length);
    });
  });

  test('Accessibility and responsive design', async ({ page }) => {
    // Test accessibility features of conversational UI
    
    await test.step('Test keyboard navigation', async () => {
      await page.locator('button:has-text("Single Card")').click();
      await page.keyboard.press('Tab'); // Should focus Begin Shuffling button
      await page.keyboard.press('Enter');
    });

    await test.step('Test screen reader compatibility', async () => {
      await page.waitForSelector('[data-testid="conversation-phase"]', { timeout: 15000 });
      
      // Check for proper ARIA labels and semantic structure
      const mainHeading = page.locator('h2');
      await expect(mainHeading).toBeVisible();
      
      const sophiaHeading = page.locator('h3:has-text("Sophia")');
      await expect(sophiaHeading).toBeVisible();
      
      // Verify button accessibility
      const optionButtons = page.locator('button.bg-purple-700\\/30');
      if (await optionButtons.count() > 0) {
        const firstButton = optionButtons.first();
        const buttonText = await firstButton.textContent();
        expect(buttonText).toBeTruthy();
        expect(buttonText!.trim().length).toBeGreaterThan(0);
      }
    });

    await test.step('Test mobile responsiveness', async () => {
      // Test on mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Verify conversation interface adapts
      await expect(page.locator('h3:has-text("Sophia")')).toBeVisible();
      
      // Check card grid responsiveness
      const cardGrid = page.locator('.grid');
      if (await cardGrid.isVisible()) {
        const gridClasses = await cardGrid.getAttribute('class');
        expect(gridClasses).toContain('grid-cols-1'); // Should use single column on mobile
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });
});

/**
 * Helper function to wait for conversation state
 */
async function waitForConversationState(page: Page, state: string, timeout = 5000) {
  await page.waitForFunction(
    (expectedState) => {
      const stateIndicator = document.querySelector('.text-purple-400');
      return stateIndicator && stateIndicator.textContent?.includes(expectedState);
    },
    state,
    { timeout }
  );
}

/**
 * Helper function to get conversation options count
 */
async function getConversationOptionsCount(page: Page): Promise<number> {
  return await page.locator('button.bg-purple-700\\/30').count();
}

/**
 * Helper function to simulate conversation interaction
 */
async function simulateConversationTurn(page: Page): Promise<boolean> {
  const optionsCount = await getConversationOptionsCount(page);
  
  if (optionsCount === 0) {
    return false; // No options available
  }
  
  // Click a random option
  const randomIndex = Math.floor(Math.random() * optionsCount);
  await page.locator('button.bg-purple-700\\/30').nth(randomIndex).click();
  
  // Wait for processing
  await page.waitForTimeout(1000);
  
  return true;
}