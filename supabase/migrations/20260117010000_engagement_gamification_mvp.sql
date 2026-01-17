-- Engagement gamification MVP (ledger + levels + streaks + weekly rankings)

-- 0) Helpers
DROP FUNCTION IF EXISTS public.eng_week_start(timestamptz);
CREATE OR REPLACE FUNCTION public.eng_week_start(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT date_trunc('week', ts)::date;
$$;

DROP FUNCTION IF EXISTS public.eng_calc_level(integer);
CREATE OR REPLACE FUNCTION public.eng_calc_level(total_points integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN total_points >= 1000 THEN 5
    WHEN total_points >= 500 THEN 4
    WHEN total_points >= 250 THEN 3
    WHEN total_points >= 100 THEN 2
    ELSE 1
  END;
$$;

-- 1) Core tables
CREATE TABLE IF NOT EXISTS public.eng_levels (
  level integer PRIMARY KEY,
  min_points integer NOT NULL,
  max_points integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.eng_levels(level, min_points, max_points)
VALUES
  (1, 0, 99),
  (2, 100, 249),
  (3, 250, 499),
  (4, 500, 999),
  (5, 1000, NULL)
ON CONFLICT (level) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.eng_user_stats (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  last_streak_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.eng_points_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  points integer NOT NULL,
  entity_type text,
  entity_id uuid,
  day date NOT NULL DEFAULT CURRENT_DATE,
  week_start date NOT NULL DEFAULT public.eng_week_start(now()),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eng_points_ledger_user_day ON public.eng_points_ledger(user_id, day);
CREATE INDEX IF NOT EXISTS idx_eng_points_ledger_user_week ON public.eng_points_ledger(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_eng_points_ledger_week_points ON public.eng_points_ledger(week_start, points);
CREATE INDEX IF NOT EXISTS idx_eng_points_ledger_entity ON public.eng_points_ledger(entity_type, entity_id);

-- Prevent duplicate rewards for the same event on the same entity
CREATE UNIQUE INDEX IF NOT EXISTS idx_eng_points_ledger_unique_entity_event
ON public.eng_points_ledger(user_id, event_type, entity_type, entity_id)
WHERE entity_id IS NOT NULL;

-- 2) Comment "useful" flag (MVP: only post owner can mark)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'comments'
  ) THEN
    EXECUTE 'ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_useful boolean NOT NULL DEFAULT false';
    EXECUTE 'ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS useful_marked_by uuid';
    EXECUTE 'ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS useful_marked_at timestamptz';
  END IF;
END $$;

-- 3) RLS
ALTER TABLE public.eng_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eng_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eng_points_ledger ENABLE ROW LEVEL SECURITY;

-- Levels are readable
DROP POLICY IF EXISTS "eng_levels_read" ON public.eng_levels;
CREATE POLICY "eng_levels_read"
ON public.eng_levels
FOR SELECT
TO authenticated
USING (true);

-- User stats are readable (for rankings/profile). Mutations are via RPC only.
DROP POLICY IF EXISTS "eng_user_stats_read" ON public.eng_user_stats;
DROP POLICY IF EXISTS "eng_user_stats_no_write" ON public.eng_user_stats;
CREATE POLICY "eng_user_stats_read"
ON public.eng_user_stats
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "eng_user_stats_no_write"
ON public.eng_user_stats
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Ledger: users can read their own ledger. Direct writes disabled.
DROP POLICY IF EXISTS "eng_points_ledger_read_own" ON public.eng_points_ledger;
DROP POLICY IF EXISTS "eng_points_ledger_no_write" ON public.eng_points_ledger;
CREATE POLICY "eng_points_ledger_read_own"
ON public.eng_points_ledger
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "eng_points_ledger_no_write"
ON public.eng_points_ledger
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- 4) RPC: award points
DROP FUNCTION IF EXISTS public.eng_award_points(text, uuid, text, uuid);
CREATE OR REPLACE FUNCTION public.eng_award_points(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor uuid;
  v_target uuid;
  v_points integer;
  v_today date := CURRENT_DATE;
  v_week_start date := public.eng_week_start(now());
  v_existing integer;
  v_comment_points_today integer;
  v_last_date date;
  v_new_streak integer;
  v_best_streak integer;
  v_total_points integer;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active session');
  END IF;

  v_target := COALESCE(p_user_id, v_actor);

  -- Authorization: allow awarding to others only for collab_accepted on accepted idea_request
  IF v_target <> v_actor THEN
    IF p_event_type <> 'collab_accepted' OR p_entity_type <> 'idea_request' OR p_entity_id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Not allowed');
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.idea_requests ir
      JOIN public.posts p ON p.id = ir.post_id
      WHERE ir.id = p_entity_id
        AND ir.user_id = v_target
        AND ir.status = 'accepted'
        AND p.user_id = v_actor
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Not authorized for this collaboration');
    END IF;
  END IF;

  -- Points mapping
  v_points := CASE p_event_type
    WHEN 'publish_project' THEN 30
    WHEN 'publish_idea' THEN 20
    WHEN 'project_update' THEN 10
    WHEN 'useful_comment' THEN 5
    WHEN 'collab_accepted' THEN 25
    WHEN 'complete_profile' THEN 15
    ELSE NULL
  END;

  IF v_points IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unknown event_type');
  END IF;

  -- Prevent duplicates for one-time events
  IF p_event_type = 'complete_profile' THEN
    SELECT COUNT(*) INTO v_existing
    FROM public.eng_points_ledger
    WHERE user_id = v_target AND event_type = 'complete_profile';

    IF v_existing > 0 THEN
      RETURN jsonb_build_object('success', true, 'awarded', 0, 'reason', 'already_awarded');
    END IF;
  END IF;

  -- Prevent duplicates on same entity/event
  IF p_entity_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_existing
    FROM public.eng_points_ledger
    WHERE user_id = v_target
      AND event_type = p_event_type
      AND COALESCE(entity_type, '') = COALESCE(p_entity_type, '')
      AND entity_id = p_entity_id;

    IF v_existing > 0 THEN
      RETURN jsonb_build_object('success', true, 'awarded', 0, 'reason', 'duplicate');
    END IF;
  END IF;

  -- Cap daily comment points
  IF p_event_type = 'useful_comment' THEN
    SELECT COALESCE(SUM(points), 0) INTO v_comment_points_today
    FROM public.eng_points_ledger
    WHERE user_id = v_target
      AND day = v_today
      AND event_type = 'useful_comment';

    IF v_comment_points_today >= 50 THEN
      RETURN jsonb_build_object('success', true, 'awarded', 0, 'reason', 'daily_cap');
    END IF;

    IF v_comment_points_today + v_points > 50 THEN
      v_points := 50 - v_comment_points_today;
      IF v_points <= 0 THEN
        RETURN jsonb_build_object('success', true, 'awarded', 0, 'reason', 'daily_cap');
      END IF;
    END IF;
  END IF;

  -- Max 1 project_update per day per project
  IF p_event_type = 'project_update' AND p_entity_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_existing
    FROM public.eng_points_ledger
    WHERE user_id = v_target
      AND day = v_today
      AND event_type = 'project_update'
      AND entity_id = p_entity_id;

    IF v_existing > 0 THEN
      RETURN jsonb_build_object('success', true, 'awarded', 0, 'reason', 'daily_project_update_cap');
    END IF;
  END IF;

  -- Insert ledger entry
  INSERT INTO public.eng_points_ledger(
    user_id,
    event_type,
    points,
    entity_type,
    entity_id,
    day,
    week_start
  ) VALUES (
    v_target,
    p_event_type,
    v_points,
    p_entity_type,
    p_entity_id,
    v_today,
    v_week_start
  );

  -- Ensure stats row exists
  INSERT INTO public.eng_user_stats(user_id)
  VALUES (v_target)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update streaks for eligible events
  IF p_event_type IN ('publish_project', 'publish_idea', 'project_update') THEN
    SELECT last_streak_date, current_streak, best_streak
    INTO v_last_date, v_new_streak, v_best_streak
    FROM public.eng_user_stats
    WHERE user_id = v_target;

    IF v_last_date = v_today THEN
      -- no change
      v_new_streak := v_new_streak;
    ELSIF v_last_date = (v_today - 1) THEN
      v_new_streak := COALESCE(v_new_streak, 0) + 1;
    ELSE
      v_new_streak := 1;
    END IF;

    v_best_streak := GREATEST(COALESCE(v_best_streak, 0), COALESCE(v_new_streak, 0));

    UPDATE public.eng_user_stats
    SET current_streak = v_new_streak,
        best_streak = v_best_streak,
        last_streak_date = v_today
    WHERE user_id = v_target;
  END IF;

  -- Update totals and level
  UPDATE public.eng_user_stats
  SET total_points = total_points + v_points,
      level = public.eng_calc_level(total_points + v_points),
      updated_at = now()
  WHERE user_id = v_target
  RETURNING total_points INTO v_total_points;

  RETURN jsonb_build_object(
    'success', true,
    'awarded', v_points,
    'total_points', v_total_points,
    'level', public.eng_calc_level(v_total_points)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.eng_award_points(text, uuid, text, uuid) TO authenticated;

-- 5) RPC: mark comment useful (author of post only)
DROP FUNCTION IF EXISTS public.eng_mark_comment_useful(uuid);
CREATE OR REPLACE FUNCTION public.eng_mark_comment_useful(p_comment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor uuid;
  v_post_id uuid;
  v_comment_user uuid;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active session');
  END IF;

  SELECT c.post_id, c.user_id INTO v_post_id, v_comment_user
  FROM public.comments c
  WHERE c.id = p_comment_id;

  IF v_post_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comment not found');
  END IF;

  -- Only post owner can mark useful
  IF NOT EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = v_post_id AND p.user_id = v_actor
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not allowed');
  END IF;

  UPDATE public.comments
  SET is_useful = true,
      useful_marked_by = v_actor,
      useful_marked_at = now()
  WHERE id = p_comment_id
    AND COALESCE(is_useful, false) = false;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', true, 'awarded', 0, 'reason', 'already_marked');
  END IF;

  -- Award points to comment author
  RETURN public.eng_award_points('useful_comment', v_comment_user, 'comment', p_comment_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.eng_mark_comment_useful(uuid) TO authenticated;

-- 6) RPC: weekly rankings (career/institution)
DROP FUNCTION IF EXISTS public.eng_get_weekly_ranking(date, text, text, integer);
CREATE OR REPLACE FUNCTION public.eng_get_weekly_ranking(
  p_week_start date DEFAULT public.eng_week_start(now()),
  p_scope text DEFAULT 'career',
  p_scope_value text DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  user_id uuid,
  username text,
  avatar_url text,
  career text,
  institution_name text,
  weekly_points bigint,
  rank integer,
  level integer,
  total_points integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      LEAST(GREATEST(p_limit, 1), 100) AS limit_count,
      p_week_start AS week_start,
      NULLIF(p_scope, '') AS scope,
      NULLIF(p_scope_value, '') AS scope_value
  ),
  points AS (
    SELECT
      l.user_id,
      SUM(l.points)::bigint AS weekly_points
    FROM public.eng_points_ledger l
    WHERE l.week_start = (SELECT week_start FROM params)
    GROUP BY l.user_id
  ),
  scoped AS (
    SELECT
      pr.id AS user_id,
      pr.username,
      pr.avatar_url,
      pr.career,
      pr.institution_name,
      COALESCE(p.weekly_points, 0)::bigint AS weekly_points,
      COALESCE(us.level, 1) AS level,
      COALESCE(us.total_points, 0) AS total_points
    FROM public.profiles pr
    LEFT JOIN points p ON p.user_id = pr.id
    LEFT JOIN public.eng_user_stats us ON us.user_id = pr.id
    WHERE
      (SELECT scope FROM params) IS NULL
      OR (
        (SELECT scope FROM params) = 'career'
        AND ((SELECT scope_value FROM params) IS NULL OR pr.career = (SELECT scope_value FROM params))
      )
      OR (
        (SELECT scope FROM params) = 'institution'
        AND ((SELECT scope_value FROM params) IS NULL OR pr.institution_name = (SELECT scope_value FROM params))
      )
  )
  SELECT
    s.user_id,
    s.username,
    s.avatar_url,
    s.career,
    s.institution_name,
    s.weekly_points,
    ROW_NUMBER() OVER (ORDER BY s.weekly_points DESC, s.username ASC)::integer AS rank,
    s.level,
    s.total_points
  FROM scoped s
  ORDER BY s.weekly_points DESC, s.username ASC
  LIMIT (SELECT limit_count FROM params);
$$;

GRANT EXECUTE ON FUNCTION public.eng_get_weekly_ranking(date, text, text, integer) TO authenticated;

-- 7) RPC: discover feed ids (Hot/Trending/TopCareer/New)
DROP FUNCTION IF EXISTS public.eng_get_discover_feed(text, uuid, integer);
CREATE OR REPLACE FUNCTION public.eng_get_discover_feed(
  p_mode text DEFAULT 'hot',
  p_viewer_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  post_id uuid,
  score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      LOWER(COALESCE(NULLIF(p_mode, ''), 'hot')) AS mode,
      LEAST(GREATEST(p_limit, 1), 100) AS limit_count,
      COALESCE(p_viewer_id, auth.uid()) AS viewer_id
  ),
  viewer AS (
    SELECT pr.career
    FROM public.profiles pr
    WHERE pr.id = (SELECT viewer_id FROM params)
  ),
  base_posts AS (
    SELECT p.id, p.user_id, p.created_at, p.post_type
    FROM public.posts p
    WHERE COALESCE(p.is_demo, false) = false
      AND p.group_id IS NULL
      AND p.company_id IS NULL
      AND COALESCE(p.visibility::text, '') = 'public'
  ),
  engagement_24h AS (
    SELECT
      bp.id AS post_id,
      COUNT(DISTINCT r.id) FILTER (WHERE r.created_at >= now() - interval '24 hours') AS reactions_24h,
      COUNT(DISTINCT c.id) FILTER (WHERE c.created_at >= now() - interval '24 hours') AS comments_24h,
      COUNT(DISTINCT s.id) FILTER (WHERE s.shared_at >= now() - interval '24 hours') AS shares_24h
    FROM base_posts bp
    LEFT JOIN public.reactions r ON r.post_id = bp.id
    LEFT JOIN public.comments c ON c.post_id = bp.id
    LEFT JOIN public.post_shares s ON s.post_id = bp.id
    GROUP BY bp.id
  ),
  scored AS (
    SELECT
      bp.id AS post_id,
      (
        (COALESCE(e.reactions_24h, 0) * 1)
        + (COALESCE(e.comments_24h, 0) * 2)
        + (COALESCE(e.shares_24h, 0) * 3)
      )::numeric AS hot_score,
      (EXTRACT(EPOCH FROM (now() - bp.created_at)) / 3600.0) AS age_hours
    FROM base_posts bp
    LEFT JOIN engagement_24h e ON e.post_id = bp.id
  ),
  filtered AS (
    SELECT s.post_id,
      CASE
        WHEN (SELECT mode FROM params) = 'new' THEN (1000000 - s.age_hours)::numeric
        WHEN (SELECT mode FROM params) = 'trending' THEN (s.hot_score / GREATEST(s.age_hours, 1))::numeric
        ELSE s.hot_score
      END AS score
    FROM scored s
    JOIN base_posts bp ON bp.id = s.post_id
    LEFT JOIN public.profiles pr ON pr.id = bp.user_id
    WHERE
      (SELECT mode FROM params) <> 'top_career'
      OR (pr.career IS NOT NULL AND pr.career = (SELECT career FROM viewer))
  )
  SELECT f.post_id, f.score
  FROM filtered f
  ORDER BY f.score DESC, f.post_id
  LIMIT (SELECT limit_count FROM params);
$$;

GRANT EXECUTE ON FUNCTION public.eng_get_discover_feed(text, uuid, integer) TO authenticated;
