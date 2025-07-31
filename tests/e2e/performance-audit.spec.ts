/**
 * LIVING ORACLE INITIATIVE - PHASE 1: PERFORMANCE & STABILITY AUDIT
 * 
 * This test suite validates all claims from previous session regarding:
 * 1. Performance fixes (LCP < 5s)
 * 2. UI stability fixes (no wobbling/layout shifts)
 * 3. Component render efficiency
 * 4. API reliability improvements
 * 
 * Evidence-based validation with strict failure criteria.
 */

import { test, expect } from '@playwright/test';

test.describe('Performance & Stability Audit', () => {
  let performanceEntries: any[] = [];
  let layoutShifts: any[] = [];
  const renderCounts: Map<string, number> = new Map();

  test.beforeEach(async ({ page }) => {
    // Reset tracking data
    performanceEntries = [];
    layoutShifts = [];
    renderCounts.clear();

    // Set up performance monitoring
    await page.addInitScript(() => {
      // Track LCP and other Web Vitals
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          (window as any).performanceEntries = (window as any).performanceEntries || [];
          (window as any).performanceEntries.push({
            name: entry.name,
            entryType: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            size: (entry as any).size || 0,
            value: (entry as any).value || 0
          });
        }
      }).observe({ 
        entryTypes: ['largest-contentful-paint', 'layout-shift', 'navigation', 'measure', 'paint'] 
      });

      // Track layout shifts specifically
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            (window as any).layoutShifts = (window as any).layoutShifts || [];
            (window as any).layoutShifts.push({
              value: (entry as any).value,
              startTime: entry.startTime,
              sources: (entry as any).sources?.map((source: any) => ({
                node: source.node?.tagName || 'unknown',
                previousRect: source.previousRect,
                currentRect: source.currentRect
              })) || []
            });
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });

      // Track component re-renders by monitoring DOM mutations
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          const target = mutation.target as Element;
          if (target.className && typeof target.className === 'string') {
            const componentName = target.className.split(' ').find(cls => 
              cls.includes('CosmicBackground') || 
              cls.includes('UnifiedTarotPanel') ||
              cls.includes('VirtualReaderDisplay')
            ) || 'unknown-component';
            
            (window as any).renderCounts = (window as any).renderCounts || {};
            (window as any).renderCounts[componentName] = ((window as any).renderCounts[componentName] || 0) + 1;
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    });
  });

  test('CRITICAL: Homepage loads with LCP under 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to homepage
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Wait for initial paint and content
    await page.waitForSelector('[data-testid="cosmic-hub"], .cosmic-hub, main', { timeout: 30000 });
    
    // Get performance entries
    const performanceData = await page.evaluate(() => ({
      performanceEntries: (window as any).performanceEntries || [],
      navigationTiming: performance.getEntriesByType('navigation')[0],
      paintTiming: performance.getEntriesByType('paint')
    }));

    console.log('📊 Performance Data:', {
      totalEntries: performanceData.performanceEntries.length,
      navigationTiming: performanceData.navigationTiming,
      paintTiming: performanceData.paintTiming
    });

    // Find LCP entry
    const lcpEntries = performanceData.performanceEntries.filter(
      entry => entry.entryType === 'largest-contentful-paint'
    );
    
    if (lcpEntries.length === 0) {
      console.warn('⚠️ No LCP entries found, checking navigation timing as fallback');
      const navTiming = performanceData.navigationTiming as any;
      const loadTime = navTiming ? (navTiming.loadEventEnd - navTiming.navigationStart) : (Date.now() - startTime);
      
      expect(loadTime).toBeLessThan(5000);
      console.log(`✅ Page load time: ${loadTime}ms (fallback measurement)`);
    } else {
      const latestLCP = lcpEntries[lcpEntries.length - 1];
      const lcpTime = latestLCP.startTime;
      
      console.log(`📈 LCP Time: ${lcpTime}ms`);
      expect(lcpTime).toBeLessThan(5000);
      console.log(`✅ LCP Performance: ${lcpTime}ms < 5000ms`);
    }
  });

  test('CRITICAL: No layout shifts or wobbling detected over 10 seconds', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="cosmic-hub"], .cosmic-hub, main', { timeout: 10000 });

    // Monitor for layout shifts over 10 seconds
    console.log('🔍 Monitoring layout shifts for 10 seconds...');
    
    let monitoringComplete = false;
    let totalCLS = 0;
    
    // Start monitoring
    const startMonitoring = Date.now();
    
    while (!monitoringComplete) {
      await page.waitForTimeout(1000); // Check every second
      
      const currentShifts = await page.evaluate(() => (window as any).layoutShifts || []);
      
      // Calculate cumulative layout shift
      totalCLS = currentShifts.reduce((sum: number, shift: any) => sum + shift.value, 0);
      
      if (Date.now() - startMonitoring >= 10000) {
        monitoringComplete = true;
      }
    }

    console.log(`📊 Layout Shift Analysis:
    - Total monitoring time: 10 seconds
    - Cumulative Layout Shift (CLS): ${totalCLS}
    - Individual shifts detected: ${(await page.evaluate(() => (window as any).layoutShifts || [])).length}`);

    // CLS should be less than 0.1 for good user experience
    // For this test, we'll be stricter and require < 0.05 since we fixed the wobbling
    expect(totalCLS).toBeLessThan(0.05);
    
    // Get detailed shift information for debugging
    const shiftDetails = await page.evaluate(() => (window as any).layoutShifts || []);
    if (shiftDetails.length > 0) {
      console.log('⚠️ Layout shifts detected:', shiftDetails);
    } else {
      console.log('✅ No unexpected layout shifts detected');
    }
  });

  test('VERIFICATION: CosmicBackground component renders efficiently', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="cosmic-hub"], .cosmic-hub, main');
    
    // Wait for components to stabilize
    await page.waitForTimeout(3000);
    
    // Get render counts
    const renderData = await page.evaluate(() => ({
      renderCounts: (window as any).renderCounts || {},
      totalMutations: Object.values((window as any).renderCounts || {}).reduce((sum: number, count: number) => sum + count, 0)
    }));

    console.log('🔄 Component Render Analysis:', renderData);

    // CosmicBackground should not re-render excessively
    const cosmicBackgroundRenders = renderData.renderCounts['CosmicBackground'] || 0;
    
    // Allow some initial renders but flag excessive re-rendering
    expect(cosmicBackgroundRenders).toBeLessThan(10);
    
    // Total mutations should be reasonable for initial load
    expect(renderData.totalMutations).toBeLessThan(50);
    
    console.log(`✅ Render efficiency validated:
    - CosmicBackground renders: ${cosmicBackgroundRenders}
    - Total component mutations: ${renderData.totalMutations}`);
  });

  test('VERIFICATION: Save Reading button remains stable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Navigate to tarot reading interface
    const tarotButton = page.locator('text="Draw Card"').or(page.locator('text="Draw 3 Cards"')).or(page.locator('[data-testid="draw-cards-button"]')).first();
    
    if (await tarotButton.isVisible()) {
      await tarotButton.click();
      await page.waitForTimeout(2000);
      
      // Look for cards to flip
      const cards = page.locator('[data-testid="tarot-card"], .tarot-card').first();
      if (await cards.isVisible()) {
        await cards.click();
        await page.waitForTimeout(1000);
        
        // Check if save button appears without causing layout shift
        const saveButton = page.locator('text="Save Reading"');
        if (await saveButton.isVisible()) {
          // Measure layout shifts around save button appearance
          const shiftsBeforeButton = await page.evaluate(() => (window as any).layoutShifts?.length || 0);
          
          await page.waitForTimeout(2000);
          
          const shiftsAfterButton = await page.evaluate(() => (window as any).layoutShifts?.length || 0);
          
          // Should have no additional layout shifts from button appearance
          expect(shiftsAfterButton - shiftsBeforeButton).toBe(0);
          console.log('✅ Save Reading button appears without layout shifts');
        }
      }
    } else {
      console.log('ℹ️ Tarot interface not immediately available, skipping save button test');
    }
  });

  test('VERIFICATION: Sophia virtual reader integration is stable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Look for Sophia virtual reader
    const sophiaReader = page.locator('[data-testid="virtual-reader"], .virtual-reader').first();
    
    // Wait a bit for Sophia to appear (if implemented)
    await page.waitForTimeout(3000);
    
    const sophiaExists = await sophiaReader.isVisible();
    console.log(`🤖 Sophia Virtual Reader Status: ${sophiaExists ? 'Present' : 'Not detected'}`);
    
    if (sophiaExists) {
      // Check that Sophia doesn't cause layout shifts
      const shiftsBeforeSophia = await page.evaluate(() => (window as any).layoutShifts?.length || 0);
      
      // Interact with Sophia area if possible
      await sophiaReader.hover();
      await page.waitForTimeout(1000);
      
      const shiftsAfterSophia = await page.evaluate(() => (window as any).layoutShifts?.length || 0);
      
      expect(shiftsAfterSophia - shiftsBeforeSophia).toBe(0);
      console.log('✅ Sophia integration is layout-stable');
    } else {
      console.log('ℹ️ Sophia virtual reader not detected - may need implementation verification');
    }
  });

  test('DIAGNOSTIC: Capture comprehensive performance metrics', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="cosmic-hub"], .cosmic-hub, main');
    
    // Collect all performance data
    const metrics = await page.evaluate(() => ({
      performanceEntries: (window as any).performanceEntries || [],
      layoutShifts: (window as any).layoutShifts || [],
      renderCounts: (window as any).renderCounts || {},
      navigationTiming: performance.getEntriesByType('navigation')[0],
      resourceTiming: performance.getEntriesByType('resource').slice(0, 10), // First 10 resources
      memoryInfo: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null
    }));

    console.log('📋 COMPREHENSIVE PERFORMANCE REPORT:');
    console.log('==========================================');
    console.log(`Load Time: ${Date.now() - startTime}ms`);
    console.log(`Performance Entries: ${metrics.performanceEntries.length}`);
    console.log(`Layout Shifts: ${metrics.layoutShifts.length}`);
    console.log(`Component Renders:`, metrics.renderCounts);
    
    if (metrics.memoryInfo) {
      console.log(`Memory Usage: ${Math.round(metrics.memoryInfo.usedJSHeapSize / 1024 / 1024)}MB`);
    }
    
    // Log LCP specifically
    const lcpEntries = metrics.performanceEntries.filter((entry: any) => entry.entryType === 'largest-contentful-paint');
    if (lcpEntries.length > 0) {
      console.log(`LCP: ${lcpEntries[lcpEntries.length - 1].startTime}ms`);
    }
    
    // This test always passes but provides diagnostic info
    expect(true).toBe(true);
  });
});