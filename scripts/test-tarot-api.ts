#!/usr/bin/env tsx

/**
 * Test script for the Tarot Data Engine
 * 
 * This script tests:
 * 1. Database connection
 * 2. Seeding functionality
 * 3. API endpoint functionality
 * 4. Data transformation
 */

import { createAdminClient } from '../src/lib/supabase/server';

const RIDER_WAITE_DECK_ID = '00000000-0000-0000-0000-000000000001';

async function testDatabaseConnection() {
  console.log('🔌 Testing database connection...');
  
  try {
    const supabase = createAdminClient();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('decks')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log('📊 Sample deck data:', data);
    return true;
  } catch (error) {
    console.error('💥 Unexpected database error:', error);
    return false;
  }
}

async function testDeckExists() {
  console.log('🃏 Checking if Rider-Waite deck exists...');
  
  try {
    const supabase = createAdminClient();
    
    const { data: deck, error } = await supabase
      .from('decks')
      .select('id, name, description')
      .eq('id', RIDER_WAITE_DECK_ID)
      .single();
    
    if (error || !deck) {
      console.log('⚠️ Rider-Waite deck not found, will be created during seeding');
      return false;
    }
    
    console.log('✅ Rider-Waite deck found:', deck);
    return true;
  } catch (error) {
    console.error('💥 Error checking deck:', error);
    return false;
  }
}

async function testCardsCount() {
  console.log('📊 Checking cards count...');
  
  try {
    const supabase = createAdminClient();
    
    const { count, error } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true })
      .eq('deck_id', RIDER_WAITE_DECK_ID);
    
    if (error) {
      console.error('❌ Error counting cards:', error);
      return 0;
    }
    
    console.log(`📈 Found ${count} cards in Rider-Waite deck`);
    return count || 0;
  } catch (error) {
    console.error('💥 Error counting cards:', error);
    return 0;
  }
}

async function testApiEndpoint() {
  console.log('🌐 Testing API endpoint...');
  
  try {
    // Simulate API call by directly testing the logic
    const supabase = createAdminClient();
    
    // Get deck info
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('id, name, description, image_url, is_active')
      .eq('id', RIDER_WAITE_DECK_ID)
      .eq('is_active', true)
      .single();
    
    if (deckError || !deck) {
      console.error('❌ API test failed - deck not found:', deckError);
      return false;
    }
    
    // Get cards
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select(`
        id,
        name,
        card_number,
        suit,
        arcana_type,
        meaning_upright,
        meaning_reversed,
        image_url,
        keywords
      `)
      .eq('deck_id', RIDER_WAITE_DECK_ID)
      .order('arcana_type', { ascending: true })
      .order('card_number', { ascending: true });
    
    if (cardsError) {
      console.error('❌ API test failed - cards fetch error:', cardsError);
      return false;
    }
    
    console.log('✅ API endpoint logic test successful');
    console.log(`📊 Deck: ${deck.name}`);
    console.log(`📈 Cards: ${cards?.length || 0}`);
    
    // Test data transformation
    const transformedCards = cards?.map(card => ({
      id: `${card.card_number}-${card.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
      name: card.name,
      arcana: card.arcana_type,
      suit: card.suit,
      number: card.card_number,
      frontImage: card.image_url,
      backImage: '/images/tarot/card-back.svg',
      meaning: {
        upright: card.meaning_upright,
        reversed: card.meaning_reversed,
        keywords: card.keywords || []
      },
      description: `${card.name} represents ${card.meaning_upright.toLowerCase()}.`
    })) || [];
    
    console.log('✅ Data transformation successful');
    console.log('📋 Sample transformed card:', transformedCards[0]);
    
    return true;
  } catch (error) {
    console.error('💥 API test error:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Tarot Data Engine Tests...\n');
  
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    console.log('❌ Database connection failed. Please check your environment variables.');
    process.exit(1);
  }
  
  console.log('');
  await testDeckExists();
  
  console.log('');
  const cardCount = await testCardsCount();
  
  console.log('');
  const apiOk = await testApiEndpoint();
  
  console.log('\n🎯 Test Summary:');
  console.log(`✅ Database Connection: OK`);
  console.log(`📊 Cards in Database: ${cardCount}`);
  console.log(`🌐 API Logic: ${apiOk ? 'OK' : 'FAILED'}`);
  
  if (cardCount === 78 && apiOk) {
    console.log('\n🎉 All tests passed! Tarot Data Engine is ready.');
  } else if (cardCount === 0) {
    console.log('\n⚠️ No cards found. Run the seeding script: npm run seed:tarot');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above.');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

export { runAllTests };
