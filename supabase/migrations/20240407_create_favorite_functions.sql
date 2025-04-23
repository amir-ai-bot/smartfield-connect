
-- Function to check if a supplier is a favorite for a user
CREATE OR REPLACE FUNCTION public.check_favorite_supplier(
  p_user_id UUID,
  p_supplier_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.favorite_suppliers
    WHERE user_id = p_user_id
    AND supplier_id = p_supplier_id
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$;

-- Function to add a favorite supplier
CREATE OR REPLACE FUNCTION public.add_favorite_supplier(
  p_user_id UUID,
  p_supplier_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if it already exists
  IF EXISTS(
    SELECT 1 FROM public.favorite_suppliers
    WHERE user_id = p_user_id
    AND supplier_id = p_supplier_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Insert the new favorite
  INSERT INTO public.favorite_suppliers(user_id, supplier_id)
  VALUES(p_user_id, p_supplier_id);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to remove a favorite supplier
CREATE OR REPLACE FUNCTION public.remove_favorite_supplier(
  p_user_id UUID,
  p_supplier_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.favorite_suppliers
  WHERE user_id = p_user_id
  AND supplier_id = p_supplier_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to get all favorite suppliers for a user
CREATE OR REPLACE FUNCTION public.get_favorite_suppliers(
  p_user_id UUID
)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'id', s.id,
    'user_id', s.user_id,
    'name', s.name,
    'category', s.category,
    'location', s.location,
    'phone', s.phone,
    'products', s.products,
    'rating', s.rating,
    'email', p.email,
    'avatar', p.avatar,
    'image', s.image
  )
  FROM public.favorite_suppliers fs
  JOIN public.suppliers s ON fs.supplier_id = s.id
  LEFT JOIN public.profiles p ON s.user_id = p.id
  WHERE fs.user_id = p_user_id;
END;
$$;
