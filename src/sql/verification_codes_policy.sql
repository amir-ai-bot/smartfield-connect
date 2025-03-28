
-- RLS policies for verification_codes
ALTER TABLE IF EXISTS public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create verification codes for themselves
CREATE POLICY IF NOT EXISTS "Users can create their own verification codes"
ON public.verification_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read their own verification codes
CREATE POLICY IF NOT EXISTS "Users can read their own verification codes"
ON public.verification_codes
FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own verification codes
CREATE POLICY IF NOT EXISTS "Users can update their own verification codes"
ON public.verification_codes
FOR UPDATE
USING (auth.uid() = user_id);
