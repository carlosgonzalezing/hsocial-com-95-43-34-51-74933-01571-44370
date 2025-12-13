-- Fix mutable search_path security issues by adding SET search_path to functions

-- 1. Fix public.create_reaction function
CREATE OR REPLACE FUNCTION public.create_reaction(p_post_id bigint, p_reaction_type text DEFAULT 'like'::text)
 RETURNS TABLE(reaction_data jsonb, error_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
    current_user_id uuid;
    new_reaction RECORD;
    err_context text;
BEGIN
    -- Get current user
    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        RETURN QUERY 
        SELECT 
            NULL::jsonb, 
            'No active session'::text;
        RETURN;
    END IF;

    BEGIN
        -- Insert the reaction
        INSERT INTO reactions (post_id, user_id, reaction_type)
        VALUES (p_post_id, current_user_id, p_reaction_type)
        RETURNING * INTO new_reaction;

        -- Return the inserted reaction
        RETURN QUERY 
        SELECT 
            to_jsonb(new_reaction),
            NULL::text;

    EXCEPTION 
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS err_context = PG_EXCEPTION_CONTEXT;
            RETURN QUERY 
            SELECT 
                NULL::jsonb, 
                (SQLERRM || ': ' || err_context)::text;
    END;
END;
$function$;

-- 2. Fix public.update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. Fix public.debug_reactions function
CREATE OR REPLACE FUNCTION public.debug_reactions()
 RETURNS TABLE(session_user_id uuid, session_user_email text, recent_posts jsonb, all_reactions jsonb, user_reactions jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
    current_session RECORD;
    posts_result RECORD;
    reactions_result RECORD;
    user_reactions_result RECORD;
BEGIN
    -- Get current session (this is a simplified example)
    current_session := (
        SELECT 
            auth.uid() AS user_id, 
            auth.email() AS user_email
    );

    IF current_session.user_id IS NULL THEN
        RAISE EXCEPTION 'No active session';
    END IF;

    -- Get recent posts
    posts_result := (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id, 
                'content', content, 
                'created_at', created_at
            )
        )
        FROM (
            SELECT id, content, created_at 
            FROM posts 
            ORDER BY created_at DESC 
            LIMIT 5
        ) recent_posts
    );

    -- Get all reactions
    reactions_result := (
        SELECT jsonb_agg(row_to_json(reactions))
        FROM (
            SELECT * 
            FROM reactions 
            ORDER BY created_at DESC
        ) reactions
    );

    -- Get user's reactions
    user_reactions_result := (
        SELECT jsonb_agg(row_to_json(user_reactions))
        FROM (
            SELECT * 
            FROM reactions 
            WHERE user_id = current_session.user_id
            ORDER BY created_at DESC
        ) user_reactions
    );

    -- Return the results
    RETURN QUERY 
    SELECT 
        current_session.user_id,
        current_session.user_email,
        posts_result,
        reactions_result,
        user_reactions_result;
END;
$function$;