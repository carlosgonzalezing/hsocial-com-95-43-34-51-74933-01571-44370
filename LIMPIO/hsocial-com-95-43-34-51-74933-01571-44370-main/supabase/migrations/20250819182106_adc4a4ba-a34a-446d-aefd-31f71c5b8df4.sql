-- Fix security warning: Function Search Path Mutable
-- Update the get_user_role_in_group function to set search_path
CREATE OR REPLACE FUNCTION public.get_user_role_in_group(group_id_param uuid, user_id_param uuid)
RETURNS text
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN (
    SELECT role 
    FROM public.group_members 
    WHERE group_id = group_id_param 
    AND user_id = user_id_param
  );
END;
$function$;