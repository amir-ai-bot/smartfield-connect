
-- RLS policies for verification_codes
ALTER TABLE IF EXISTS public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all verification codes (for admin operations)
CREATE POLICY IF NOT EXISTS "Service role can manage all verification codes"
ON public.verification_codes
FOR ALL
USING (auth.role() = 'service_role');

-- Allow authenticated users to create verification codes 
-- This policy has been modified to not check user_id when creating
CREATE POLICY IF NOT EXISTS "Users can create verification codes"
ON public.verification_codes
FOR INSERT
WITH CHECK (true);

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
