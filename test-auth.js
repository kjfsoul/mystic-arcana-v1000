// Test authentication flow
const { chromium } = require('playwright');

async function testAuth() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔄 Testing authentication flow...');
  
  try {
    // 1. Go to the app
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);
    
    // 2. Click Sign Up button
    console.log('📍 Looking for Sign Up button...');
    const signUpButton = await page.locator('button:has-text("Sign Up")').first();
    if (await signUpButton.isVisible()) {
      console.log('✅ Found Sign Up button');
      await signUpButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 3. Check if modal opened
    const modal = await page.locator('[class*="modal"]').first();
    if (await modal.isVisible()) {
      console.log('✅ Auth modal is visible');
      
      // 4. Test signup flow
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      console.log(`📧 Testing signup with: ${testEmail}`);
      
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check for errors
      const error = await page.locator('[class*="error"]').first();
      if (await error.isVisible()) {
        const errorText = await error.textContent();
        console.log(`❌ Signup error: ${errorText}`);
      } else {
        console.log('✅ No visible errors after signup attempt');
      }
      
      // Check if still on same page or redirected
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      // Check session state
      const sessionState = await page.evaluate(() => {
        const authDebug = document.querySelector('[class*="authDebug"]');
        return authDebug ? authDebug.textContent : 'No debug info found';
      });
      console.log(`🔐 Session state: ${sessionState}`);
      
    } else {
      console.log('❌ Auth modal did not open');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  console.log('\n📊 Test complete. Press Ctrl+C to close browser.');
  // Keep browser open for manual inspection
  await page.waitForTimeout(300000);
}

testAuth();