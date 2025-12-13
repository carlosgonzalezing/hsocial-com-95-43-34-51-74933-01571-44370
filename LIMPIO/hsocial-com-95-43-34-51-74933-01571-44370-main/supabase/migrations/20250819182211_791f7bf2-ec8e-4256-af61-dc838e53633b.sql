-- Fix remaining functions to have proper search_path
-- Update all functions that might be missing search_path

CREATE OR REPLACE FUNCTION public.get_social_level(score_param integer)
RETURNS TABLE(level_name text, min_score integer, max_score integer, icon_name text, color_from text, color_to text, benefits jsonb)
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.is_premium_user(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
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
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT CASE 
    WHEN public.is_premium_user(user_id_param) THEN 20
    ELSE 1
  END;
$function$;