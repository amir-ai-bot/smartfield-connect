
-- Function to get all suppliers with their profile information
CREATE OR REPLACE FUNCTION public.get_all_suppliers()
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'id', s.id,
    'user_id', s.user_id,
    'category', s.category,
    'rating', s.rating,
    'location', s.location,
    'phone', s.phone,
    'products', s.products,
    'name', p.name,
    'email', p.email,
    'avatar', p.avatar
  )
  FROM public.suppliers s
  JOIN public.profiles p ON s.user_id = p.id
  ORDER BY s.rating DESC;
END;
$$;

-- Function to count suppliers
CREATE OR REPLACE FUNCTION public.get_suppliers_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total integer;
BEGIN
  SELECT COUNT(*) INTO total FROM public.suppliers;
  RETURN total;
END;
$$;

-- Function to add a default supplier
CREATE OR REPLACE FUNCTION public.add_default_supplier(
  supplier_name text,
  supplier_email text,
  supplier_password text,
  supplier_category text,
  supplier_rating float,
  supplier_location text,
  supplier_phone text,
  supplier_products text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create a user account first
  PERFORM admin_create_user(
    supplier_name,
    supplier_email,
    supplier_password,
    'fournisseur'
  );
  
  -- Get the user ID
  SELECT id INTO new_user_id
  FROM public.profiles
  WHERE email = supplier_email;
  
  IF new_user_id IS NULL THEN
    RAISE EXCEPTION 'Failed to create user for supplier: %', supplier_name;
  END IF;
  
  -- Create the supplier entry
  INSERT INTO public.suppliers (
    user_id,
    category,
    rating,
    location,
    phone,
    products
  ) VALUES (
    new_user_id,
    supplier_category,
    supplier_rating,
    supplier_location,
    supplier_phone,
    supplier_products
  );
END;
$$;
