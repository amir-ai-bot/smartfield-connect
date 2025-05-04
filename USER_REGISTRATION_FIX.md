# User Registration Fix

This document outlines the changes made to fix the "Database error saving new user" issue.

## Changes Made

1. **Added Database Trigger**: Created a trigger to automatically create a profile when a user is created in auth.users.
   - File: `src/sql/user_profile_trigger.sql`

2. **Updated SignUp Functions**: Enhanced error handling and added manual profile creation as a fallback.
   - Files: 
     - `src/contexts/AuthContext.tsx`
     - `src/services/authService.ts`

3. **Added RLS Policies**: Created proper Row Level Security policies for the profiles table.
   - File: `src/sql/profiles_rls.sql`

4. **Created Application Script**: Added a script to apply the SQL trigger to the database.
   - File: `src/scripts/apply_user_trigger.js`

## How to Apply These Changes

### 1. Apply the Database Trigger and RLS Policies

You have two options:

#### Option A: Using the Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `src/sql/user_profile_trigger.sql` and `src/sql/profiles_rls.sql`
4. Paste into the SQL Editor and run the queries

#### Option B: Using the Script (Requires Service Role Key)

1. Set your Supabase service role key as an environment variable:
   ```
   export SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```

2. Run the script:
   ```
   node src/scripts/apply_user_trigger.js
   ```

### 2. Test User Registration

After applying the changes, test the user registration process:

1. Try to register a new user
2. Check the browser console for detailed logs
3. Verify that a profile is created in the profiles table

## Troubleshooting

If you still encounter issues:

1. **Check Console Logs**: Look for detailed error messages in the browser console
2. **Verify Database Schema**: Make sure the profiles table has the correct fields
3. **Check RLS Policies**: Ensure the policies are correctly applied
4. **Test with Minimal Data**: Try registering with just email and password

## Additional Notes

- The changes include both automatic profile creation via a database trigger and manual profile creation as a fallback
- Enhanced logging has been added to help diagnose any remaining issues
- The RLS policies ensure proper security while allowing the necessary operations
