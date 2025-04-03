
-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  rating FLOAT DEFAULT 0,
  location TEXT NOT NULL,
  phone TEXT,
  products TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for suppliers table
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Public can view all suppliers
CREATE POLICY "Public can view suppliers" 
ON public.suppliers 
FOR SELECT 
USING (true);

-- Users can manage their own supplier data
CREATE POLICY "Users can manage their own supplier data" 
ON public.suppliers 
FOR ALL 
USING (auth.uid() = user_id);

-- Admins can manage all supplier data
CREATE POLICY "Admins can manage all supplier data" 
ON public.suppliers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
