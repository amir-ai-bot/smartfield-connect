import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Update the user's role to admin in the profiles table
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', profile.id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update user role' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Update the user's metadata in auth.users
    const { error: metadataError } = await supabaseClient.auth.admin.updateUserById(
      profile.id,
      { user_metadata: { role: 'admin' } }
    )

    if (metadataError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update user metadata' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    return new Response(
      JSON.stringify({ message: 'User role updated to admin successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 