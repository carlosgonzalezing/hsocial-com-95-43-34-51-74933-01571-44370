-- Crear función optimizada para obtener un grupo individual
CREATE OR REPLACE FUNCTION public.get_group_by_slug_or_id(slug_or_id_param text)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  slug text,
  avatar_url text,
  is_private boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  created_by uuid,
  category text,
  tags text[],
  rules text,
  cover_url text,
  post_count bigint,
  member_count bigint,
  created_by_username text,
  created_by_avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    g.id,
    g.name,
    g.description,
    g.slug,
    g.avatar_url,
    g.is_private,
    g.created_at,
    g.updated_at,
    g.created_by,
    g.category,
    g.tags,
    g.rules,
    g.cover_url,
    COALESCE(pc.post_count, 0) as post_count,
    COALESCE(mc.member_count, 0) as member_count,
    p.username as created_by_username,
    p.avatar_url as created_by_avatar_url
  FROM public.groups g
  LEFT JOIN (
    SELECT group_id, COUNT(*) as member_count
    FROM public.group_members
    GROUP BY group_id
  ) mc ON g.id = mc.group_id
  LEFT JOIN (
    SELECT 
      g2.id as group_id,
      COUNT(posts.id) as post_count
    FROM public.groups g2
    LEFT JOIN public.posts ON posts.group_id = g2.id AND posts.visibility = 'public'
    GROUP BY g2.id
  ) pc ON g.id = pc.group_id
  LEFT JOIN public.profiles p ON g.created_by = p.id
  WHERE g.slug = slug_or_id_param OR g.id::text = slug_or_id_param
  LIMIT 1;
$$;