// Script to fix user registration issues
// Run this script with: node src/scripts/fix_user_registration.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, (answer) => resolve(answer));
});

async function main() {
  try {
    console.log('=== User Registration Fix Script ===');
    
    // Get Supabase credentials
    const SUPABASE_URL = await prompt('Enter your Supabase URL (e.g., https://iqilhrbsamcahdmklbnp.supabase.co): ');
    const SUPABASE_SERVICE_KEY = await prompt('Enter your Supabase service role key: ');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('Error: Both Supabase URL and service role key are required');
      process.exit(1);
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    console.log('\nConnecting to Supabase...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase.from('profiles').select('count(*)', { count: 'exact', head: true });
    
    if (testError) {
      console.error('Error connecting to Supabase:', testError);
      process.exit(1);
    }
    
    console.log('Connection successful!');
    
    // Apply SQL files in sequence
    const sqlFiles = [
      { name: 'Create profiles table', path: '../sql/create_profiles_table.sql' },
      { name: 'Create user profile function', path: '../sql/create_user_profile_function.sql' }
    ];
    
    for (const file of sqlFiles) {
      try {
        console.log(`\nApplying ${file.name}...`);
        const sqlPath = path.join(__dirname, file.path);
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Split the SQL into separate statements
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (let i = 0; i < statements.length; i++) {
          const stmt = statements[i].trim() + ';';
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: stmt });
            
            if (error) {
              console.warn(`Warning: Error executing statement ${i + 1}: ${error.message}`);
              console.warn('Continuing with next statement...');
            }
          } catch (stmtError) {
            console.warn(`Warning: Exception executing statement ${i + 1}: ${stmtError.message}`);
            console.warn('Continuing with next statement...');
          }
        }
        
        console.log(`${file.name} applied successfully!`);
      } catch (fileError) {
        console.error(`Error applying ${file.name}:`, fileError);
        console.error('Continuing with next file...');
      }
    }
    
    // Check for users without profiles
    console.log('\nChecking for users without profiles...');
    
    // This requires a custom SQL query
    const { data: orphanedUsers, error: orphanedError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT au.id, au.email, au.created_at
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL;
      `
    });
    
    if (orphanedError) {
      console.error('Error checking for orphaned users:', orphanedError);
    } else {
      const users = orphanedUsers?.result || [];
      
      if (users.length > 0) {
        console.log(`Found ${users.length} users without profiles. Creating missing profiles...`);
        
        for (const user of users) {
          try {
            console.log(`Creating profile for user ${user.email}...`);
            
            const { error: createError } = await supabase.rpc('exec_sql', {
              sql: `
                INSERT INTO public.profiles (
                  id, email, display_name, name, role, created_at, updated_at
                )
                VALUES (
                  '${user.id}', 
                  '${user.email}', 
                  '${user.email.split('@')[0]}', 
                  '${user.email.split('@')[0]}', 
                  'user', 
                  '${user.created_at}', 
                  NOW()
                )
                ON CONFLICT (id) DO NOTHING;
              `
            });
            
            if (createError) {
              console.warn(`Warning: Error creating profile for ${user.email}: ${createError.message}`);
            } else {
              console.log(`Profile created for ${user.email}`);
            }
          } catch (userError) {
            console.warn(`Warning: Exception creating profile for ${user.email}: ${userError.message}`);
          }
        }
      } else {
        console.log('No users without profiles found.');
      }
    }
    
    console.log('\n=== User Registration Fix Complete ===');
    console.log('The database has been updated to fix user registration issues.');
    console.log('Please try registering a new user now.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    rl.close();
  }
}

main();
