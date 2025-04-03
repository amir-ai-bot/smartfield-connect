
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Update user role to 'fournisseur'
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'fournisseur' })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update user role" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Create default supplier entry if none exists
    const { error: insertError } = await supabase
      .from('suppliers')
      .insert({
        user_id: userId,
        category: 'Autre',
        location: 'Gafsa Centre',
        products: []
      })
      .onConflict('user_id')
      .ignore();

    if (insertError) {
      console.error('Error creating supplier:', insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create supplier entry" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in approve-fournisseur-request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
