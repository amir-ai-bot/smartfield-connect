const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function deleteDefaultSuppliers() {
  try {
    console.log('Deleting default suppliers...');
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .is('user_id', null);

    if (error) {
      console.error('Error deleting default suppliers:', error);
      return false;
    }

    console.log('Default suppliers deleted successfully');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

deleteDefaultSuppliers(); 