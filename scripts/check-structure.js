// Check exact table structure
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
  console.log('Checking users table structure...\n');
  
  // Get column info
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(0);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Try to get one row to see structure
  const { data: row, error: rowError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
    
  if (row && row.length > 0) {
    console.log('Columns:', Object.keys(row[0]));
    console.log('Sample row:', row[0]);
  } else if (rowError) {
    console.error('Row error:', rowError);
  } else {
    console.log('Table is empty, checking schema...');
    // Try inserting minimal data
    const { data: test, error: testErr } = await supabase
      .from('users')
      .insert({ address: '0xtest1234567890123456789012345678901234567' })
      .select();
    console.log('Insert test:', testErr?.message || 'Success');
    if (!testErr) {
      await supabase.from('users').delete().eq('address', '0xtest1234567890123456789012345678901234567');
    }
  }
}

checkStructure();
