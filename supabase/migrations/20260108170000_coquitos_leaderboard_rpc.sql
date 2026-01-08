-- Coquitos Destacados leaderboard RPC

DROP FUNCTION IF EXISTS public.get_coquitos_leaderboard(integer, integer);

CREATE OR REPLACE FUNCTION public.get_coquitos_leaderboard(
  limit_count integer DEFAULT 50,
  window_days integer DEFAULT 30
)
RETURNS TABLE(
  user_id uuid,
  username text,
  avatar_url text,
  career text,
  score numeric,
  rank integer,
  posts_count bigint,
  reactions_received bigint,
  comments_received bigint,
  shares_received bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      LEAST(GREATEST(limit_count, 1), 100) AS limit_count,
      LEAST(GREATEST(window_days, 1), 90) AS window_days
  ),
  base_posts AS (
    SELECT
      p.id,
      p.user_id,
      p.created_at,
      p.post_type
    FROM public.posts p
    WHERE p.created_at >= (now() - ((SELECT window_days FROM params) || ' days')::interval)
      AND p.visibility = 'public'::post_visibility
      AND COALESCE(p.is_demo, false) = false
      AND p.group_id IS NULL
      AND p.company_id IS NULL
  ),
  posts_by_user AS (
    SELECT
      bp.user_id,
      COUNT(*)::bigint AS posts_count,
      COUNT(*) FILTER (WHERE bp.post_type = 'project')::bigint AS project_posts_count
    FROM base_posts bp
    GROUP BY bp.user_id
  ),
  reactions_received_by_user AS (
    SELECT
      bp.user_id,
      COUNT(r.id)::bigint AS reactions_received
    FROM base_posts bp
    JOIN public.reactions r ON r.post_id = bp.id
    WHERE r.user_id <> bp.user_id
    GROUP BY bp.user_id
  ),
  comments_received_by_user AS (
    SELECT
      bp.user_id,
      COUNT(c.id)::bigint AS comments_received
    FROM base_posts bp
    JOIN public.comments c ON c.post_id = bp.id
    WHERE c.user_id <> bp.user_id
    GROUP BY bp.user_id
  ),
  shares_received_by_user AS (
    SELECT
      bp.user_id,
      COUNT(s.id)::bigint AS shares_received
    FROM base_posts bp
    JOIN public.post_shares s ON s.post_id = bp.id
    WHERE s.user_id <> bp.user_id
    GROUP BY bp.user_id
  ),
  scored AS (
    SELECT
      pu.user_id,
      pu.posts_count,
      COALESCE(rr.reactions_received, 0) AS reactions_received,
      COALESCE(cr.comments_received, 0) AS comments_received,
      COALESCE(sr.shares_received, 0) AS shares_received,
      (
        (pu.posts_count * 2)
        + (COALESCE(pu.project_posts_count, 0) * 3)
        + (COALESCE(rr.reactions_received, 0) * 1)
        + (COALESCE(cr.comments_received, 0) * 2)
        + (COALESCE(sr.shares_received, 0) * 3)
      )::numeric AS score
    FROM posts_by_user pu
    LEFT JOIN reactions_received_by_user rr ON rr.user_id = pu.user_id
    LEFT JOIN comments_received_by_user cr ON cr.user_id = pu.user_id
    LEFT JOIN shares_received_by_user sr ON sr.user_id = pu.user_id
  )
  SELECT
    pr.id AS user_id,
    pr.username,
    pr.avatar_url,
    pr.career,
    s.score,
    ROW_NUMBER() OVER (ORDER BY s.score DESC, pr.username ASC)::integer AS rank,
    s.posts_count,
    s.reactions_received,
    s.comments_received,
    s.shares_received
  FROM scored s
  JOIN public.profiles pr ON pr.id = s.user_id
  ORDER BY s.score DESC, pr.username ASC
  LIMIT (SELECT limit_count FROM params);
$$;

GRANT EXECUTE ON FUNCTION public.get_coquitos_leaderboard(integer, integer) TO anon, authenticated;
