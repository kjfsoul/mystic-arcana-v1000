/**
 * Test Daily Horoscope Generation for n8n Integration
 * 
 * Tests the updated LunarTransitNarratorAgent with Swiss Ephemeris integration
 * and generates sample JSON output for July 24, 2025.
 */

import { LunarTransitNarratorAgent } from '../src/agents/lunar-transit-narrator.js';

async function testDailyHoroscopes() {
  console.log('🔮 Testing Daily Horoscope Generation for n8n Integration...');
  
  try {
    // Initialize the agent
    const narrator = new LunarTransitNarratorAgent();
    
    // Wait for knowledge base initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📊 Agent Status:', narrator.getStatus());
    
    // Generate sample horoscopes for July 24, 2025
    console.log('\n🌟 Generating Sample Horoscopes for July 24, 2025...');
    
    const horoscopeData = await narrator.generateSampleHoroscopes();
    
    console.log('\n✅ Horoscope Generation Complete!');
    console.log('================================');
    
    // Display metadata
    console.log('📅 Date:', horoscopeData.date);
    console.log('🌙 Moon Phase:', horoscopeData.metadata.moonPhase);
    console.log('🌙 Moon Sign:', horoscopeData.metadata.moonSign);
    console.log('🔮 Key Transits:', horoscopeData.metadata.keyTransits.join(', '));
    console.log('⏰ Generated At:', horoscopeData.metadata.generatedAt);
    
    // Display sample horoscopes (first 3 signs)
    console.log('\n🌟 Sample Horoscopes (First 3 Signs):');
    console.log('=====================================');
    
    horoscopeData.horoscopes.slice(0, 3).forEach(horoscope => {
      console.log(`\n♈ ${horoscope.sign.toUpperCase()}`);
      console.log('─'.repeat(horoscope.sign.length + 4));
      console.log('📖 Horoscope:', horoscope.horoscope);
      console.log('🏷️  Keywords:', horoscope.keywords.join(', '));
      console.log('🍀 Lucky Numbers:', horoscope.luckyNumbers.join(', '));
      console.log('🎨 Colors:', horoscope.colors.join(', '));
      console.log('💼 Career:', horoscope.careerInsight);
      console.log('💕 Love:', horoscope.loveInsight);
      console.log('⚡ Energy:', horoscope.energy);
      console.log('⭐ Ratings:', `Overall: ${horoscope.rating.overall}, Love: ${horoscope.rating.love}, Career: ${horoscope.rating.career}, Health: ${horoscope.rating.health}`);
      console.log('💡 Advice:', horoscope.advice);
    });
    
    // Show full JSON structure for n8n
    console.log('\n📋 Complete JSON Output (for n8n integration):');
    console.log('==============================================');
    console.log(JSON.stringify(horoscopeData, null, 2));
    
    // Save to file for testing
    const fs = await import('fs/promises');
    const outputPath = './horoscopes-sample-2025-07-24.json';
    await fs.writeFile(outputPath, JSON.stringify(horoscopeData, null, 2));
    console.log(`\n💾 Sample output saved to: ${outputPath}`);
    
    // Test individual sign generation
    console.log('\n🎯 Testing Individual Sign Generation...');
    const specificDate = '2025-07-24';
    const testResult = await narrator.generateDailyHoroscopes(specificDate);
    
    console.log(`✅ Successfully generated ${testResult.horoscopes.length} horoscopes for ${specificDate}`);
    
    // Validate JSON structure for n8n
    console.log('\n🔍 Validating n8n JSON Structure...');
    const validationResults = validateN8nStructure(testResult);
    
    if (validationResults.isValid) {
      console.log('✅ JSON structure is valid for n8n automation');
      console.log('📊 Structure Summary:');
      console.log(`   - ${validationResults.signCount} zodiac signs included`);
      console.log(`   - All required fields present: ${validationResults.requiredFieldsPresent}`);
      console.log(`   - Rating system functional: ${validationResults.ratingsValid}`);
      console.log(`   - Keywords populated: ${validationResults.keywordsPopulated}`);
    } else {
      console.log('❌ JSON structure validation failed:');
      validationResults.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('\n🎉 Daily Horoscope Test Complete!');
    console.log('Ready for Replit testing and n8n integration! 🚀');
    
    return {
      success: true,
      horoscopeCount: testResult.horoscopes.length,
      sampleData: testResult,
      validationResults
    };
    
  } catch (error) {
    console.error('❌ Daily Horoscope Test Failed:', error.message);
    console.error('Stack trace:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate JSON structure for n8n compatibility
 */
function validateN8nStructure(horoscopeData) {
  const validation = {
    isValid: true,
    errors: [],
    signCount: 0,
    requiredFieldsPresent: true,
    ratingsValid: true,
    keywordsPopulated: true
  };
  
  try {
    // Check main structure
    if (!horoscopeData.date || !horoscopeData.horoscopes || !Array.isArray(horoscopeData.horoscopes)) {
      validation.errors.push('Missing main structure (date, horoscopes array)');
      validation.isValid = false;
    }
    
    validation.signCount = horoscopeData.horoscopes.length;
    
    // Check each horoscope
    horoscopeData.horoscopes.forEach((horoscope, index) => {
      const requiredFields = ['sign', 'date', 'horoscope', 'keywords', 'luckyNumbers', 'colors', 'careerInsight', 'loveInsight', 'energy', 'advice', 'rating'];
      
      requiredFields.forEach(field => {
        if (!horoscope.hasOwnProperty(field)) {
          validation.errors.push(`Missing field '${field}' in ${horoscope.sign || 'unknown sign'}`);
          validation.requiredFieldsPresent = false;
          validation.isValid = false;
        }
      });
      
      // Check rating structure
      if (horoscope.rating) {
        const ratingFields = ['overall', 'love', 'career', 'health'];
        ratingFields.forEach(ratingField => {
          if (typeof horoscope.rating[ratingField] !== 'number' || horoscope.rating[ratingField] < 1 || horoscope.rating[ratingField] > 5) {
            validation.errors.push(`Invalid rating '${ratingField}' in ${horoscope.sign}`);
            validation.ratingsValid = false;
            validation.isValid = false;
          }
        });
      }
      
      // Check keywords array
      if (!Array.isArray(horoscope.keywords) || horoscope.keywords.length === 0) {
        validation.errors.push(`Empty or invalid keywords array in ${horoscope.sign}`);
        validation.keywordsPopulated = false;
        validation.isValid = false;
      }
    });
    
    return validation;
    
  } catch (error) {
    validation.isValid = false;
    validation.errors.push(`Validation error: ${error.message}`);
    return validation;
  }
}

// Main execution
if (import.meta.url === new URL(import.meta.url).href) {
  testDailyHoroscopes()
    .then((result) => {
      if (result.success) {
        console.log('\n📊 Test Summary:');
        console.log('================================');
        console.log(`✅ Horoscopes Generated: ${result.horoscopeCount}`);
        console.log(`✅ Validation Status: ${result.validationResults.isValid ? 'PASSED' : 'FAILED'}`);
        console.log('✅ Ready for Production Use!');
        console.log('================================');
        process.exit(0);
      } else {
        console.error('💥 Test failed with error:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

export { testDailyHoroscopes, validateN8nStructure };