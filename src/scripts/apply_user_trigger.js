// Script to apply the user profile trigger to the Supabase database
// Run this script with: node src/scripts/apply_user_trigger.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || "https://iqilhrbsamcahdmklbnp.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // This should be the service_role key, not the anon key

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.error('This should be the service_role key from your Supabase project settings');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyTrigger() {
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../sql/user_profile_trigger.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying user profile trigger to database...');
    
    // Execute the SQL using Supabase's rpc function
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error applying trigger:', error);
      return;
    }
    
    console.log('User profile trigger applied successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

applyTrigger();
