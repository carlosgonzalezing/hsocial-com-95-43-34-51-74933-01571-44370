-- Fix the recursive RLS policy in group_members table
-- The current policy references group_members within the policy which causes infinite recursion

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage group members" ON public.group_members;

-- Create a security definer function to get user role safely
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate the policy using the security definer function
CREATE POLICY "Admins can manage group members" 
ON public.group_members 
FOR ALL 
USING (
  public.get_user_role_in_group(group_id, auth.uid()) IN ('admin', 'moderator')
)
WITH CHECK (
  public.get_user_role_in_group(group_id, auth.uid()) IN ('admin', 'moderator')
);