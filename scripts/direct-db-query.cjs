require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getTheSunInterpretation() {
  const { data, error } = await supabase
    .from('tarot_interpretations')
    .select('upright')
    .eq('card_name', 'The Sun')
    .single();

  if (error) {
    console.error('Error fetching The Sun interpretation:', error);
    return;
  }

  console.log(data.upright);
}

getTheSunInterpretation();
