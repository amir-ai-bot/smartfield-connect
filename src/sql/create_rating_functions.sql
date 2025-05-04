
-- Function to get all ratings for a supplier
CREATE OR REPLACE FUNCTION get_supplier_ratings(supplier_id UUID)
RETURNS SETOF ratings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.ratings
  WHERE fournisseur_id = supplier_id
  ORDER BY created_at DESC;
END;
$$;

-- Function to get a specific user's rating for a supplier
CREATE OR REPLACE FUNCTION get_user_rating_for_supplier(p_user_id UUID, p_supplier_id UUID)
RETURNS SETOF ratings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.ratings
  WHERE user_id = p_user_id AND fournisseur_id = p_supplier_id
  LIMIT 1;
END;
$$;

-- Function to add or update a rating
CREATE OR REPLACE FUNCTION add_or_update_rating(
  p_user_id UUID,
  p_supplier_id UUID,
  p_rating INTEGER,
  p_comment TEXT DEFAULT NULL
)
RETURNS SETOF ratings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_rating_id UUID;
  result_record ratings;
BEGIN
  -- Check if rating already exists
  SELECT id INTO existing_rating_id
  FROM public.ratings
  WHERE user_id = p_user_id AND fournisseur_id = p_supplier_id;
  
  IF existing_rating_id IS NOT NULL THEN
    -- Update existing rating
    UPDATE public.ratings
    SET rating = p_rating,
        comment = p_comment,
        updated_at = now()
    WHERE id = existing_rating_id
    RETURNING * INTO result_record;
  ELSE
    -- Insert new rating
    INSERT INTO public.ratings (
      user_id,
      fournisseur_id,
      rating,
      comment
    )
    VALUES (
      p_user_id,
      p_supplier_id,
      p_rating,
      p_comment
    )
    RETURNING * INTO result_record;
  END IF;
  
  -- Update supplier average rating
  PERFORM update_supplier_average_rating(p_supplier_id);
  
  RETURN NEXT result_record;
END;
$$;

-- Function to update supplier average rating
CREATE OR REPLACE FUNCTION update_supplier_average_rating(p_supplier_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  -- Calculate average rating
  SELECT AVG(rating) INTO avg_rating
  FROM public.ratings
  WHERE fournisseur_id = p_supplier_id;
  
  -- Update supplier rating
  UPDATE public.suppliers
  SET rating = COALESCE(avg_rating, 0)
  WHERE id = p_supplier_id;
END;
$$;
