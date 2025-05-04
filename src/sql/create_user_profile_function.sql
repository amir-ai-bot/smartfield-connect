-- Create a function to create a user profile
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT DEFAULT 'user',
  user_phone TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    name,
    role,
    phone_number,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    user_email,
    user_name,
    user_name,
    user_role,
    user_phone,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;
