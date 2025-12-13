
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Create RPC functions
    const { error: getPrivacyFunctionError } = await supabaseClient.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.get_user_story_privacy(user_id_input UUID)
        RETURNS TEXT AS $$
        DECLARE
          privacy_setting TEXT;
        BEGIN
          -- Try to find a privacy setting
          SELECT story_privacy INTO privacy_setting
          FROM user_settings
          WHERE user_id = user_id_input;
          
          -- Return default value if not found
          IF privacy_setting IS NULL THEN
            RETURN 'public';
          END IF;
          
          RETURN privacy_setting;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    })

    if (getPrivacyFunctionError) {
      throw getPrivacyFunctionError
    }

    const { error: savePrivacyFunctionError } = await supabaseClient.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.save_user_story_privacy(user_id_input UUID, privacy_setting TEXT)
        RETURNS BOOLEAN AS $$
        BEGIN
          -- Insert or update privacy setting
          INSERT INTO user_settings (user_id, story_privacy)
          VALUES (user_id_input, privacy_setting)
          ON CONFLICT (user_id)
          DO UPDATE SET
            story_privacy = privacy_setting,
            updated_at = now();
            
          RETURN TRUE;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    })

    if (savePrivacyFunctionError) {
      throw savePrivacyFunctionError
    }

    // Create the user_settings table if it doesn't exist
    const { error: createTableError } = await supabaseClient.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.user_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          story_privacy TEXT DEFAULT 'public',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Add RLS policies
        ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        DROP POLICY IF EXISTS "Users can read their own settings" ON public.user_settings;
        CREATE POLICY "Users can read their own settings"
          ON public.user_settings FOR SELECT
          USING (auth.uid() = user_id);
          
        DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
        CREATE POLICY "Users can update their own settings"
          ON public.user_settings FOR UPDATE
          USING (auth.uid() = user_id);
          
        DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
        CREATE POLICY "Users can insert their own settings"
          ON public.user_settings FOR INSERT
          WITH CHECK (auth.uid() = user_id);
      `
    })

    if (createTableError) {
      throw createTableError
    }

    // Create function to execute SQL queries directly (admin only)
    const { error: execSqlFunctionError } = await supabaseClient.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.exec_sql(sql_query TEXT)
        RETURNS VOID AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    })

    if (execSqlFunctionError) {
      throw execSqlFunctionError
    }

    return new Response(
      JSON.stringify({ 
        message: "Successfully created database functions for story privacy settings"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 400 
      },
    )
  }
})
