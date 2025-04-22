import { supabase } from './client';

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to fetch a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Connection error:', error);
      return false;
    }

    console.log('Connection successful!');
    console.log('Sample data:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Run the test
testConnection(); 