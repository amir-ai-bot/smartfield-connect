-- Drop existing functions first
DROP FUNCTION IF EXISTS public.admin_verify_user(UUID);
DROP FUNCTION IF EXISTS public.admin_delete_user(UUID);
DROP FUNCTION IF EXISTS public.admin_create_user(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_update_user_password(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_all_suppliers();

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

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.suppliers;

-- Create suppliers table with proper structure
CREATE TABLE public.suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Autre',
    rating FLOAT DEFAULT 0,
    location TEXT DEFAULT 'Non spécifié',
    phone TEXT,
    products TEXT[] DEFAULT ARRAY[]::TEXT[],
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON public.suppliers(category);

-- Set up Row Level Security (RLS)
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.suppliers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.suppliers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for supplier owners" ON public.suppliers
    FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.suppliers TO postgres;
GRANT SELECT ON public.suppliers TO anon;
GRANT SELECT, INSERT, UPDATE ON public.suppliers TO authenticated;

-- Insert some initial test data
INSERT INTO public.suppliers (name, category, rating, location, phone, products, contact_info)
VALUES 
    ('AgriEquipment', 'Matériel agricole', 4.5, 'Tunis, Tunisia', '+216 71 123 456', ARRAY['Tracteurs', 'Moissonneuses', 'Pulvérisateurs'], NULL),
    ('BioAgri', 'Agriculture biologique', 4.7, 'Sousse, Tunisia', '+216 73 654 321', ARRAY['Fertilisants bio', 'Pesticides naturels', 'Semences bio'], NULL),
    ('AgroSolutions', 'Irrigation', 4.3, 'Sfax, Tunisia', '+216 74 987 654', ARRAY['Systèmes d''irrigation', 'Pompes', 'Filtres'], NULL),
    ('TechAgro', 'Technologies agricoles', 4.6, 'Bizerte, Tunisia', '+216 72 456 789', ARRAY['Drones agricoles', 'Capteurs', 'Logiciels de gestion'], NULL),
    ('GreenHarvest', 'Semences et plants', 4.4, 'Nabeul, Tunisia', '+216 72 321 654', ARRAY['Semences certifiées', 'Plants maraîchers', 'Arbres fruitiers'], NULL)
ON CONFLICT (id) DO NOTHING;

-- Create function to get all suppliers
CREATE OR REPLACE FUNCTION public.get_all_suppliers()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    name TEXT,
    category TEXT,
    rating FLOAT,
    location TEXT,
    phone TEXT,
    email TEXT,
    products TEXT[],
    avatar TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.user_id,
        s.name,
        s.category,
        s.rating,
        s.location,
        s.phone,
        p.email,
        s.products,
        p.avatar_url as avatar
    FROM public.suppliers s
    LEFT JOIN public.profiles p ON s.user_id = p.id
    ORDER BY s.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.suppliers TO authenticated;
GRANT SELECT ON public.suppliers TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_suppliers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_suppliers() TO anon;

-- Disable RLS temporarily to debug
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;

-- Clear and reinsert the suppliers
TRUNCATE public.suppliers CASCADE;

INSERT INTO public.suppliers (name, category, rating, location, phone, products)
VALUES 
    ('AgriEquipment', 'Matériel agricole', 4.5, 'Tunis, Tunisia', '+216 71 123 456', ARRAY['Tracteurs', 'Moissonneuses', 'Pulvérisateurs']),
    ('BioAgri', 'Agriculture biologique', 4.7, 'Sousse, Tunisia', '+216 73 654 321', ARRAY['Fertilisants bio', 'Pesticides naturels', 'Semences bio']),
    ('AgroSolutions', 'Irrigation', 4.3, 'Sfax, Tunisia', '+216 74 987 654', ARRAY['Systèmes d''irrigation', 'Pompes', 'Filtres']),
    ('TechAgro', 'Technologies agricoles', 4.6, 'Bizerte, Tunisia', '+216 72 456 789', ARRAY['Drones agricoles', 'Capteurs', 'Logiciels de gestion']),
    ('GreenHarvest', 'Semences et plants', 4.4, 'Nabeul, Tunisia', '+216 72 321 654', ARRAY['Semences certifiées', 'Plants maraîchers', 'Arbres fruitiers']);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON public.suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON public.suppliers(created_at);

-- Additional permissions for suppliers table
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON public.suppliers FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated insert"
ON public.suppliers FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure the RLS is enabled and policies are in place
ALTER TABLE public.suppliers FORCE ROW LEVEL SECURITY;

-- Additional grants for the suppliers table
GRANT INSERT ON public.suppliers TO authenticated;
GRANT UPDATE ON public.suppliers TO authenticated;
GRANT DELETE ON public.suppliers TO authenticated;

