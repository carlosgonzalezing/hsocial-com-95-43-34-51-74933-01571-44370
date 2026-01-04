import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { paymentId, action } = await req.json();
    
    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    let result;
    
    if (action === "confirm") {
      const { data, error } = await supabaseClient
        .rpc("confirm_payment_and_activate_subscription", {
          payment_id_param: paymentId
        });
      
      if (error) throw error;
      result = data;
    } else if (action === "reject") {
      const { data, error } = await supabaseClient
        .rpc("reject_payment", {
          payment_id_param: paymentId
        });
      
      if (error) throw error;
      result = data;
    } else {
      throw new Error("Invalid action. Use 'confirm' or 'reject'");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Error interno del servidor'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});