DROP FUNCTION IF EXISTS public.get_public_post_comments_preview(uuid, integer);

CREATE OR REPLACE FUNCTION public.get_public_post_comments_preview(
  p_post_id uuid,
  limit_count integer DEFAULT 2
)
RETURNS TABLE(
  id uuid,
  post_id uuid,
  user_id uuid,
  content text,
  created_at timestamptz,
  parent_id uuid,
  media_url text,
  media_type text,
  profiles jsonb,
  likes_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT
    c.id,
    c.post_id,
    c.user_id,
    c.content,
    c.created_at,
    c.parent_id,
    c.media_url,
    c.media_type,
    jsonb_build_object(
      'id', pr.id,
      'username', pr.username,
      'avatar_url', pr.avatar_url
    ) as profiles,
    COALESCE(r.likes_count, 0) as likes_count
  FROM public.comments c
  JOIN public.posts p ON p.id = c.post_id
  JOIN public.profiles pr ON pr.id = c.user_id
  LEFT JOIN (
    SELECT comment_id, COUNT(*)::bigint as likes_count
    FROM public.reactions
    WHERE comment_id IS NOT NULL
    GROUP BY comment_id
  ) r ON r.comment_id = c.id
  WHERE c.post_id = p_post_id
    AND c.parent_id IS NULL
    AND p.visibility = 'public'::post_visibility
  ORDER BY c.created_at ASC
  LIMIT LEAST(GREATEST(limit_count, 1), 3);
$$;

GRANT EXECUTE ON FUNCTION public.get_public_post_comments_preview(uuid, integer) TO anon, authenticated;
