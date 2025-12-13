-- Fix search_path security issue by updating existing functions
-- This addresses the mutable search_path vulnerability

-- Update existing functions to have secure search_path
CREATE OR REPLACE FUNCTION public.get_social_level(score_param integer)
 RETURNS TABLE(level_name text, min_score integer, max_score integer, icon_name text, color_from text, color_to text, benefits jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    sl.level_name,
    sl.min_score,
    sl.max_score,
    sl.icon_name,
    sl.color_from,
    sl.color_to,
    sl.benefits
  FROM public.social_levels sl
  WHERE score_param >= sl.min_score 
    AND (sl.max_score IS NULL OR score_param <= sl.max_score)
  ORDER BY sl.min_score DESC
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_group_creator(group_id_param uuid, user_id_param uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT created_by = user_id_param 
  FROM public.groups 
  WHERE id = group_id_param;
$function$;

CREATE OR REPLACE FUNCTION public.is_premium_user(user_id_param uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = user_id_param
      AND status = 'active'
      AND end_date > now()
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_hearts_limit(user_id_param uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE 
    WHEN public.is_premium_user(user_id_param) THEN 20
    ELSE 1
  END;
$function$;

-- Create saved_posts table for the saved functionality
CREATE TABLE public.saved_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS for saved_posts
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_posts
CREATE POLICY "Users can view their own saved posts"
ON public.saved_posts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
ON public.saved_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their posts"
ON public.saved_posts
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to toggle saved posts
CREATE OR REPLACE FUNCTION public.toggle_saved_post(post_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_id_val uuid;
  is_saved boolean;
BEGIN
  -- Get current user
  SELECT auth.uid() INTO user_id_val;
  IF user_id_val IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if post is already saved
  SELECT EXISTS(
    SELECT 1 FROM public.saved_posts 
    WHERE user_id = user_id_val AND post_id = post_id_param
  ) INTO is_saved;
  
  IF is_saved THEN
    -- Remove from saved
    DELETE FROM public.saved_posts 
    WHERE user_id = user_id_val AND post_id = post_id_param;
    RETURN false;
  ELSE
    -- Add to saved
    INSERT INTO public.saved_posts (user_id, post_id)
    VALUES (user_id_val, post_id_param);
    RETURN true;
  END IF;
END;
$$;