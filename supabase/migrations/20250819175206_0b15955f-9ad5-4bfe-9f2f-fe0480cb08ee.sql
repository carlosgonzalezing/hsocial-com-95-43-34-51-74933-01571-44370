-- Fix the search path for the security definer function to avoid security warnings
CREATE OR REPLACE FUNCTION public.get_user_role_in_group(group_id_param uuid, user_id_param uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.group_members 
    WHERE group_id = group_id_param 
    AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';