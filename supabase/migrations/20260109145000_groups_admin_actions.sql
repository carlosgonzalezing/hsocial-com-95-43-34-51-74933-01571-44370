-- Groups admin actions: edit group, list members/requests, approve/deny, remove members, delete group

-- List group members (active members) with profile info
CREATE OR REPLACE FUNCTION public.get_group_members(group_id_param uuid)
RETURNS TABLE(
  user_id uuid,
  role text,
  joined_at timestamp with time zone,
  username text,
  avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    gm.user_id,
    gm.role,
    gm.joined_at,
    p.username,
    p.avatar_url
  FROM public.group_members gm
  JOIN public.profiles p ON p.id = gm.user_id
  WHERE gm.group_id = group_id_param
  ORDER BY
    CASE gm.role WHEN 'admin' THEN 0 WHEN 'moderator' THEN 1 ELSE 2 END,
    gm.joined_at ASC;
$$;

-- List pending join requests (admin/mod only)
CREATE OR REPLACE FUNCTION public.get_group_join_requests(group_id_param uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  status text,
  message text,
  created_at timestamp with time zone,
  username text,
  avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.user_id,
    r.status,
    r.message,
    r.created_at,
    p.username,
    p.avatar_url
  FROM public.group_join_requests r
  JOIN public.profiles p ON p.id = r.user_id
  WHERE r.group_id = group_id_param
    AND r.status = 'pending'
    AND EXISTS (
      SELECT 1
      FROM public.group_members gm
      WHERE gm.group_id = r.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('admin','moderator')
    )
  ORDER BY r.created_at ASC;
$$;

-- Get my membership role in a group (null if not a member)
CREATE OR REPLACE FUNCTION public.get_my_group_membership(group_id_param uuid)
RETURNS TABLE(
  role text,
  joined_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gm.role, gm.joined_at
  FROM public.group_members gm
  WHERE gm.group_id = group_id_param
    AND gm.user_id = auth.uid()
  LIMIT 1;
$$;

-- Remove a member from group (admin/mod only; cannot remove the last admin)
CREATE OR REPLACE FUNCTION public.remove_group_member(
  group_id_param uuid,
  user_id_param uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requester_role text;
  target_role text;
  admin_count int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT gm.role INTO requester_role
  FROM public.group_members gm
  WHERE gm.group_id = group_id_param AND gm.user_id = auth.uid();

  IF requester_role IS NULL OR requester_role NOT IN ('admin','moderator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'No autorizado');
  END IF;

  SELECT gm.role INTO target_role
  FROM public.group_members gm
  WHERE gm.group_id = group_id_param AND gm.user_id = user_id_param;

  IF target_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuario no es miembro');
  END IF;

  IF target_role = 'admin' THEN
    SELECT COUNT(*) INTO admin_count
    FROM public.group_members gm
    WHERE gm.group_id = group_id_param AND gm.role = 'admin';

    IF admin_count <= 1 THEN
      RETURN jsonb_build_object('success', false, 'error', 'No puedes eliminar al último admin');
    END IF;
  END IF;

  DELETE FROM public.group_members
  WHERE group_id = group_id_param AND user_id = user_id_param;

  UPDATE public.groups
  SET member_count = (SELECT COUNT(*) FROM public.group_members WHERE group_id = group_id_param)
  WHERE id = group_id_param;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Update group metadata (admin/mod only)
CREATE OR REPLACE FUNCTION public.update_group_profile(
  group_id_param uuid,
  name_param text DEFAULT NULL,
  description_param text DEFAULT NULL,
  category_param text DEFAULT NULL,
  tags_param text[] DEFAULT NULL,
  rules_param text DEFAULT NULL,
  is_private_param boolean DEFAULT NULL,
  avatar_url_param text DEFAULT NULL,
  cover_url_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requester_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT gm.role INTO requester_role
  FROM public.group_members gm
  WHERE gm.group_id = group_id_param AND gm.user_id = auth.uid();

  IF requester_role IS NULL OR requester_role NOT IN ('admin','moderator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'No autorizado');
  END IF;

  UPDATE public.groups
  SET
    name = COALESCE(NULLIF(name_param, ''), name),
    description = COALESCE(description_param, description),
    category = COALESCE(category_param, category),
    tags = COALESCE(tags_param, tags),
    rules = COALESCE(rules_param, rules),
    is_private = COALESCE(is_private_param, is_private),
    avatar_url = COALESCE(avatar_url_param, avatar_url),
    cover_url = COALESCE(cover_url_param, cover_url),
    updated_at = now()
  WHERE id = group_id_param;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Delete group (admin only)
CREATE OR REPLACE FUNCTION public.delete_group(group_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requester_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT gm.role INTO requester_role
  FROM public.group_members gm
  WHERE gm.group_id = group_id_param AND gm.user_id = auth.uid();

  IF requester_role IS NULL OR requester_role <> 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'No autorizado');
  END IF;

  DELETE FROM public.groups WHERE id = group_id_param;

  RETURN jsonb_build_object('success', true);
END;
$$;
