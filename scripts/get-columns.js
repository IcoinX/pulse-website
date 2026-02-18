// Get exact columns from users table
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getColumns() {
  // Insert a test row
  const testAddr = '0xtest' + Date.now();
  const { data: inserted, error: insertErr } = await supabase
    .from('users')
    .insert({ address: testAddr })
    .select();
    
  if (inserted && inserted.length > 0) {
    console.log('Columns in users table:');
    Object.keys(inserted[0]).forEach(col => {
      console.log(`  - ${col}: ${JSON.stringify(inserted[0][col])}`);
    });
    
    // Cleanup
    await supabase.from('users').delete().eq('address', testAddr);
  } else {
    console.error('Insert error:', insertErr);
  }
}

getColumns();
