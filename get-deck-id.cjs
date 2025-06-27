const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getDeckId() {
  const { data: decks, error } = await supabase
    .from('decks')
    .select('id, name, is_active')
    .eq('is_active', true);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Active Decks:');
    decks.forEach(deck => {
      console.log(`- ${deck.name}: ${deck.id}`);
    });
  }
}

getDeckId();