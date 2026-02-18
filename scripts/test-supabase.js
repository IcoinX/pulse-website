// Test script to verify Supabase connection and tables
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...\n');
  
  // Test 1: Check if users table exists
  console.log('1. Checking users table...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (usersError) {
    console.error('   ❌ users table error:', usersError.message);
  } else {
    console.log('   ✅ users table exists');
  }
  
  // Test 2: Check if auth_nonces table exists
  console.log('\n2. Checking auth_nonces table...');
  const { data: nonces, error: noncesError } = await supabase
    .from('auth_nonces')
    .select('*')
    .limit(1);
  
  if (noncesError) {
    console.error('   ❌ auth_nonces table error:', noncesError.message);
  } else {
    console.log('   ✅ auth_nonces table exists');
  }
  
  // Test 3: Try to insert a test user
  console.log('\n3. Testing user insert...');
  const testAddress = '0x1234567890123456789012345678901234567890';
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .upsert({
      address: testAddress.toLowerCase(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'address',
      ignoreDuplicates: false
    })
    .select()
    .single();
  
  if (insertError) {
    console.error('   ❌ Insert error:', insertError.message);
    console.error('   Code:', insertError.code);
    console.error('   Details:', insertError.details);
  } else {
    console.log('   ✅ Insert successful, user ID:', newUser.id);
    
    // Clean up test user
    await supabase.from('users').delete().eq('address', testAddress.toLowerCase());
    console.log('   ✅ Test user cleaned up');
  }
  
  console.log('\n--- Test complete ---');
}

testConnection().catch(console.error);
