# User Registration Fix - Complete Solution

This document provides a comprehensive solution to fix the "Database error saving new user" issue.

## Root Cause Analysis

The error occurs because:

1. The profiles table might not exist or have the correct schema
2. The database trigger to automatically create profiles might be missing
3. The Row Level Security (RLS) policies might be preventing profile creation
4. The field names in the code might not match the database schema

## Solution Overview

We've implemented a multi-layered solution to ensure user registration works correctly:

1. **Database Schema Fix**: Created SQL scripts to ensure the profiles table exists with the correct schema
2. **Database Trigger**: Added a trigger to automatically create profiles when users are created
3. **Stored Procedure**: Created a stored procedure for creating user profiles
4. **Multiple Fallbacks**: Updated the signup code with multiple fallback mechanisms
5. **Enhanced Error Handling**: Added detailed logging and error handling
6. **Fix Script**: Created a script to apply all database changes and fix existing users

## Files Created/Modified

1. **SQL Scripts**:
   - `src/sql/create_profiles_table.sql`: Creates the profiles table with the correct schema and trigger
   - `src/sql/create_user_profile_function.sql`: Creates a stored procedure for profile creation
   - `src/sql/profiles_rls.sql`: Sets up proper RLS policies

2. **JavaScript Files**:
   - `src/scripts/fix_user_registration.js`: Script to apply all database changes
   - `src/services/authService.ts`: Updated with robust signup logic
   - `src/contexts/AuthContext.tsx`: Updated with robust signup logic

## How to Apply the Fix

### Step 1: Run the Fix Script

This script will apply all necessary database changes and fix existing users:

```bash
# Install dependencies if needed
npm install

# Run the fix script
node src/scripts/fix_user_registration.js
```

You'll need to provide:
- Your Supabase URL (e.g., https://iqilhrbsamcahdmklbnp.supabase.co)
- Your Supabase service role key (from the Supabase dashboard)

### Step 2: Apply SQL Changes Manually (Alternative)

If the script doesn't work, you can apply the SQL changes manually:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the contents of these files in order:
   - `src/sql/create_profiles_table.sql`
   - `src/sql/create_user_profile_function.sql`
   - `src/sql/profiles_rls.sql`

### Step 3: Test User Registration

After applying the changes, test the user registration process:

1. Try to register a new user
2. Check the browser console for detailed logs
3. Verify that a profile is created in the profiles table

## Troubleshooting

If you still encounter issues:

### Check Database Schema

Verify the profiles table exists with the correct schema:

```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles';
```

### Check Database Trigger

Verify the trigger exists:

```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

### Check RLS Policies

Verify the RLS policies are correctly set:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';
```

### Check for Orphaned Users

Find users without profiles:

```sql
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

### Create Missing Profiles

Create profiles for orphaned users:

```sql
INSERT INTO public.profiles (
  id, email, display_name, name, role, created_at, updated_at
)
SELECT 
  au.id, 
  au.email, 
  COALESCE(au.raw_user_meta_data->>'name', au.email), 
  COALESCE(au.raw_user_meta_data->>'name', au.email), 
  COALESCE(au.raw_user_meta_data->>'role', 'user'), 
  au.created_at, 
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

## Additional Notes

- The solution includes both automatic profile creation via a database trigger and multiple fallback mechanisms
- Enhanced logging has been added to help diagnose any remaining issues
- The RLS policies ensure proper security while allowing the necessary operations
- The fix script will also repair any existing users that don't have profiles
