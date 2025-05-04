
-- Create ratings table for supplier ratings
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  fournisseur_id UUID REFERENCES public.suppliers(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, fournisseur_id)
);

-- Add RLS policies
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Users can view all ratings (public information)
CREATE POLICY "Anyone can view ratings" 
ON public.ratings 
FOR SELECT 
USING (true);

-- Users can only insert their own ratings
CREATE POLICY "Users can add their own ratings" 
ON public.ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own ratings
CREATE POLICY "Users can update their own ratings" 
ON public.ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can only delete their own ratings
CREATE POLICY "Users can delete their own ratings" 
ON public.ratings 
FOR DELETE 
USING (auth.uid() = user_id);
