// Check auth_nonces structure
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNonces() {
  const { data, error } = await supabase
    .from('auth_nonces')
    .insert({
      wallet_address: '0xtest1234567890123456789012345678901234567',
      nonce: 'test123',
      expires_at: new Date(Date.now() + 5*60*1000).toISOString()
    })
    .select();
    
  if (data) {
    console.log('auth_nonces columns:', Object.keys(data[0]));
    await supabase.from('auth_nonces').delete().eq('nonce', 'test123');
  } else {
    console.error('Error:', error);
  }
}

checkNonces();
