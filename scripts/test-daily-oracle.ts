#!/usr/bin/env tsx

/**
 * Daily Oracle API Manual Test Script
 * Tests the comprehensive oracle endpoint functionality
 */

import { BirthData } from '@/types/astrology';

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testDailyOracle() {
  console.log('🔮 Testing Daily Oracle API...\n');

  const testBirthData: BirthData = {
    name: 'Test User',
    date: new Date('1990-06-15T10:30:00Z'),
    city: 'New York',
    country: 'USA',
    lat: 40.7128,
    lng: -74.0060
  };

  const requestBody = {
    birthData: testBirthData,
    userId: 'test-script-user'
  };

  try {
    console.log('📡 Making request to /api/oracle/daily...');
    
    const response = await fetch(`${API_BASE}/api/oracle/daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Success! Response received:\n');
    
    // Display summary of the oracle data
    if (data.success && data.data) {
      const oracle = data.data;
      
      console.log('🌟 DAILY ORACLE SUMMARY');
      console.log('=====================');
      console.log(`Date: ${oracle.date}`);
      console.log(`User: ${oracle.userId || 'Anonymous'}`);
      console.log(`Generated from Birth Chart: ${oracle.generatedFromBirthChart ? 'Yes' : 'No'}`);
      console.log(`Cached: ${data.cached ? 'Yes' : 'No'}`);
      console.log(`Generation Time: ${data.generationTimeMs}ms\n`);
      
      console.log('🔯 HOROSCOPE');
      console.log('============');
      console.log(`Sign: ${oracle.horoscope.sign} (${oracle.horoscope.degrees}°)`);
      console.log(`Element: ${oracle.horoscope.element} | Quality: ${oracle.horoscope.quality}`);
      console.log(`Ruling Planet: ${oracle.horoscope.rulingPlanet}`);
      console.log(`Daily Message: ${oracle.horoscope.daily}\n`);
      
      console.log('🃏 DAILY TAROT SPREAD');
      console.log('====================');
      console.log(`Theme: ${oracle.dailySpread.theme}`);
      console.log();
      console.log(`🌅 MORNING (${oracle.dailySpread.cards.morning.card.position}):`);
      console.log(`   Card: ${oracle.dailySpread.cards.morning.card.name} ${oracle.dailySpread.cards.morning.card.isReversed ? '(Reversed)' : ''}`);
      console.log(`   Keywords: ${oracle.dailySpread.cards.morning.card.keywords?.join(', ')}`);
      console.log(`   Personal Message: ${oracle.dailySpread.cards.morning.personalizedMessage}`);
      console.log();
      console.log(`🌞 AFTERNOON (${oracle.dailySpread.cards.afternoon.card.position}):`);
      console.log(`   Card: ${oracle.dailySpread.cards.afternoon.card.name} ${oracle.dailySpread.cards.afternoon.card.isReversed ? '(Reversed)' : ''}`);
      console.log(`   Keywords: ${oracle.dailySpread.cards.afternoon.card.keywords?.join(', ')}`);
      console.log(`   Personal Message: ${oracle.dailySpread.cards.afternoon.personalizedMessage}`);
      console.log();
      console.log(`🌙 EVENING (${oracle.dailySpread.cards.evening.card.position}):`);
      console.log(`   Card: ${oracle.dailySpread.cards.evening.card.name} ${oracle.dailySpread.cards.evening.card.isReversed ? '(Reversed)' : ''}`);
      console.log(`   Keywords: ${oracle.dailySpread.cards.evening.card.keywords?.join(', ')}`);
      console.log(`   Personal Message: ${oracle.dailySpread.cards.evening.personalizedMessage}`);
      console.log();
      console.log(`Overall Guidance: ${oracle.dailySpread.overallGuidance}`);
      console.log(`Practical Advice: ${oracle.dailySpread.practicalAdvice}\n`);
      
      console.log('🌌 COSMIC FOCUS');
      console.log('===============');
      console.log(`Moon Phase: ${oracle.cosmicFocus.moonPhase} in ${oracle.cosmicFocus.moonSign}`);
      console.log(`Dominant Planet: ${oracle.cosmicFocus.dominantPlanet}`);
      console.log(`Energy Theme: ${oracle.cosmicFocus.energyTheme}`);
      console.log(`Recommendation: ${oracle.cosmicFocus.recommendation}`);
      console.log('Key Aspects:');
      oracle.cosmicFocus.keyAspects.forEach((aspect, i) => {
        console.log(`   ${i + 1}. ${aspect}`);
      });
      console.log();
      
      console.log('💕 COMPATIBILITY INSIGHTS');
      console.log('=========================');
      console.log(`Best Match: ${oracle.compatibility.bestMatchSign}`);
      console.log(`Challenging Sign: ${oracle.compatibility.challengingSign}`);
      console.log(`Relationship Advice: ${oracle.compatibility.relationshipAdvice}`);
      console.log(`Communication Tips: ${oracle.compatibility.communicationTips}\n`);
      
      console.log('🎯 DAILY GUIDANCE');
      console.log('=================');
      console.log(`Overall Theme: ${oracle.overallTheme}\n`);
      console.log(`Key Message: ${oracle.keyMessage}\n`);
      console.log('Actionable Advice:');
      oracle.actionableAdvice.forEach((advice, i) => {
        console.log(`   ${i + 1}. ${advice}`);
      });
      console.log();
      console.log(`Daily Affirmation: "${oracle.affirmation}"\n`);
      
      if (oracle.isUnavailable) {
        console.log('⚠️  Note: Some services were unavailable during generation');
        if (oracle.errorDetails) {
          console.log(`   Error Details: ${oracle.errorDetails}`);
        }
      }
      
    } else {
      console.error('❌ API returned unsuccessful response:', data);
    }

  } catch (error) {
    console.error('💥 Error testing Daily Oracle API:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
    }
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...\n');

  try {
    console.log('📡 Testing missing birth data...');
    
    const response = await fetch(`${API_BASE}/api/oracle/daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: 'test-user' }) // Missing birthData
    });

    const data = await response.json();
    
    if (response.status === 400 && !data.success) {
      console.log('✅ Error handling works correctly');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error}`);
    } else {
      console.log('❌ Expected 400 error but got:', response.status, data);
    }

  } catch (error) {
    console.error('💥 Error in error handling test:', error);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  testDailyOracle()
    .then(() => testErrorHandling())
    .then(() => {
      console.log('\n🎉 Daily Oracle API testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test script failed:', error);
      process.exit(1);
    });
}

export { testDailyOracle, testErrorHandling };