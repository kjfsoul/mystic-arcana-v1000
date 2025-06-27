const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔄 Testing Supabase Authentication...\n');
  
  // Test 1: Sign Up
  console.log('1️⃣ Testing Sign Up...');
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });
  
  if (signUpError) {
    console.log(`❌ Sign Up Error: ${signUpError.message}`);
  } else if (signUpData.user && !signUpData.session) {
    console.log(`📧 Sign Up Success! Email confirmation required for: ${testEmail}`);
    console.log(`   User ID: ${signUpData.user.id}`);
  } else if (signUpData.session) {
    console.log(`✅ Sign Up Success! Auto-logged in as: ${testEmail}`);
  }
  
  console.log('\n2️⃣ Testing Sign In with wrong password...');
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'wrongpassword'
  });
  
  if (signInError) {
    console.log(`✅ Expected error: ${signInError.message}`);
  }
  
  console.log('\n3️⃣ Checking current session...');
  const { data: { session } } = await supabase.auth.getSession();
  console.log(`Current session: ${session ? 'Active' : 'None'}`);
  
  console.log('\n✅ Authentication test complete!');
}

testAuth().catch(console.error);