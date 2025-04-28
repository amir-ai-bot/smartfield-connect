

-- Function to verify a user's email by admin
CREATE OR REPLACE FUNCTION public.admin_verify_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- This will run with SECURITY DEFINER privileges (superuser)
  UPDATE auth.users
  SET email_confirmed_at = CURRENT_TIMESTAMP
  WHERE id = user_id;
END;
$$;

-- Function to delete a user by admin
CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- This will run with SECURITY DEFINER privileges (superuser)
  DELETE FROM auth.users
  WHERE id = user_id;
  -- The profile will be deleted by a trigger
END;
$$;

-- Function to create a user by admin
CREATE OR REPLACE FUNCTION public.admin_create_user(
  user_name TEXT,
  user_email TEXT,
  user_password TEXT,
  user_role TEXT DEFAULT 'user'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create the user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    (SELECT instance_id FROM auth.instances LIMIT 1),
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    CURRENT_TIMESTAMP,
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('name', user_name, 'role', user_role),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  RETURNING id INTO new_user_id;

  -- Create the profile manually
  INSERT INTO public.profiles (id, name, email, role, created_at, updated_at)
  VALUES (
    new_user_id,
    user_name,
    user_email,
    user_role,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
END;
$$;

-- Function to update a user's password by admin
CREATE OR REPLACE FUNCTION public.admin_update_user_password(
  user_id UUID,
  new_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- This will run with SECURITY DEFINER privileges (superuser)
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = user_id;
END;
$$;

