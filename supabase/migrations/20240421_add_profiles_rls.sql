-- Enable Row Level Security for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow service role to manage all profiles (for admin operations)
CREATE POLICY "Service role can manage all profiles"
ON public.profiles
FOR ALL
USING (auth.role() = 'service_role');

-- Allow authenticated users to read basic profile info of other users
CREATE POLICY "Authenticated users can read basic profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT ALL ON public.profiles TO postgres;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated; 