-- Analytics Pro MVP: events + daily aggregates + RPCs

-- 1) Tables
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_owner_created_at
  ON public.analytics_events(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_entity
  ON public.analytics_events(entity_type, entity_id);

-- Prevent spam for logged-in users on same entity/event/day
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_events_dedupe_logged
  ON public.analytics_events(owner_id, actor_id, event_type, entity_type, entity_id, ((created_at AT TIME ZONE 'UTC')::date))
  WHERE actor_id IS NOT NULL AND entity_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.analytics_daily (
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT CURRENT_DATE,
  event_type text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY(owner_id, day, event_type)
);

CREATE TABLE IF NOT EXISTS public.analytics_daily_entity (
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT CURRENT_DATE,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY(owner_id, day, event_type, entity_type, entity_id)
);

-- 2) RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_entity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS analytics_events_owner_read ON public.analytics_events;
CREATE POLICY analytics_events_owner_read
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS analytics_events_no_direct_write ON public.analytics_events;
CREATE POLICY analytics_events_no_direct_write
  ON public.analytics_events
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS analytics_daily_owner_read ON public.analytics_daily;
CREATE POLICY analytics_daily_owner_read
  ON public.analytics_daily
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS analytics_daily_no_direct_write ON public.analytics_daily;
CREATE POLICY analytics_daily_no_direct_write
  ON public.analytics_daily
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS analytics_daily_entity_owner_read ON public.analytics_daily_entity;
CREATE POLICY analytics_daily_entity_owner_read
  ON public.analytics_daily_entity
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS analytics_daily_entity_no_direct_write ON public.analytics_daily_entity;
CREATE POLICY analytics_daily_entity_no_direct_write
  ON public.analytics_daily_entity
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- 3) Fix project_views unique rule: only enforce uniqueness for logged-in viewers
ALTER TABLE public.project_views
  DROP CONSTRAINT IF EXISTS project_views_post_id_viewer_id_key;

DROP INDEX IF EXISTS public.idx_project_views_logged;
CREATE UNIQUE INDEX idx_project_views_logged
  ON public.project_views(post_id, viewer_id)
  WHERE viewer_id IS NOT NULL;

-- 4) RPC: tracking
DROP FUNCTION IF EXISTS public.track_analytics_event(text, text, uuid, uuid, boolean, jsonb);
CREATE OR REPLACE FUNCTION public.track_analytics_event(
  p_event_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_owner_id uuid,
  p_is_anonymous boolean DEFAULT false,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor uuid;
  v_day date := CURRENT_DATE;
BEGIN
  v_actor := auth.uid();

  -- Anonymous events: only aggregate counters
  IF p_is_anonymous OR v_actor IS NULL THEN
    INSERT INTO public.analytics_daily(owner_id, day, event_type, count)
    VALUES (p_owner_id, v_day, p_event_type, 1)
    ON CONFLICT (owner_id, day, event_type)
    DO UPDATE SET count = analytics_daily.count + 1;

    IF p_entity_id IS NOT NULL THEN
      INSERT INTO public.analytics_daily_entity(owner_id, day, event_type, entity_type, entity_id, count)
      VALUES (p_owner_id, v_day, p_event_type, p_entity_type, p_entity_id, 1)
      ON CONFLICT (owner_id, day, event_type, entity_type, entity_id)
      DO UPDATE SET count = analytics_daily_entity.count + 1;
    END IF;

    -- Optional: update lightweight counters
    IF p_entity_type = 'profile' AND p_event_type = 'profile_view' THEN
      INSERT INTO public.engagement_metrics(user_id, profile_views_today, profile_views_total)
      VALUES (p_owner_id, 1, 1)
      ON CONFLICT (user_id)
      DO UPDATE SET
        profile_views_today = CASE
          WHEN engagement_metrics.last_reset_date < CURRENT_DATE THEN 1
          ELSE engagement_metrics.profile_views_today + 1
        END,
        profile_views_total = engagement_metrics.profile_views_total + 1,
        last_reset_date = CASE
          WHEN engagement_metrics.last_reset_date < CURRENT_DATE THEN CURRENT_DATE
          ELSE engagement_metrics.last_reset_date
        END,
        updated_at = now();
    END IF;

    RETURN jsonb_build_object('success', true, 'stored', 'aggregate_only');
  END IF;

  -- Logged-in events: store the raw event + aggregates
  INSERT INTO public.analytics_events(owner_id, actor_id, event_type, entity_type, entity_id, metadata)
  VALUES (p_owner_id, v_actor, p_event_type, p_entity_type, p_entity_id, COALESCE(p_metadata, '{}'::jsonb))
  ON CONFLICT DO NOTHING;

  INSERT INTO public.analytics_daily(owner_id, day, event_type, count)
  VALUES (p_owner_id, v_day, p_event_type, 1)
  ON CONFLICT (owner_id, day, event_type)
  DO UPDATE SET count = analytics_daily.count + 1;

  IF p_entity_id IS NOT NULL THEN
    INSERT INTO public.analytics_daily_entity(owner_id, day, event_type, entity_type, entity_id, count)
    VALUES (p_owner_id, v_day, p_event_type, p_entity_type, p_entity_id, 1)
    ON CONFLICT (owner_id, day, event_type, entity_type, entity_id)
    DO UPDATE SET count = analytics_daily_entity.count + 1;
  END IF;

  RETURN jsonb_build_object('success', true, 'stored', 'event_and_aggregate');
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_analytics_event(text, text, uuid, uuid, boolean, jsonb) TO authenticated;

-- 5) RPC: summary (default 7 days)
DROP FUNCTION IF EXISTS public.get_my_analytics_summary(integer);
CREATE OR REPLACE FUNCTION public.get_my_analytics_summary(p_days integer DEFAULT 7)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT LEAST(GREATEST(p_days, 1), 90) AS days
  ),
  base AS (
    SELECT *
    FROM public.analytics_daily ad
    WHERE ad.owner_id = auth.uid()
      AND ad.day >= (CURRENT_DATE - ((SELECT days FROM params) - 1))
  )
  SELECT jsonb_build_object(
    'days', (SELECT days FROM params),
    'profile_views', COALESCE((SELECT SUM(count) FROM base WHERE event_type = 'profile_view'), 0),
    'project_views', COALESCE((SELECT SUM(count) FROM base WHERE event_type = 'project_view'), 0),
    'project_click_demo', COALESCE((SELECT SUM(count) FROM base WHERE event_type = 'project_click_demo'), 0),
    'project_click_contact', COALESCE((SELECT SUM(count) FROM base WHERE event_type = 'project_click_contact'), 0)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_my_analytics_summary(integer) TO authenticated;

-- 6) RPC: daily series
DROP FUNCTION IF EXISTS public.get_my_analytics_daily(integer);
CREATE OR REPLACE FUNCTION public.get_my_analytics_daily(p_days integer DEFAULT 7)
RETURNS TABLE(
  day date,
  profile_views integer,
  project_views integer,
  project_click_demo integer,
  project_click_contact integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT LEAST(GREATEST(p_days, 1), 90) AS days
  ),
  days AS (
    SELECT generate_series(
      (CURRENT_DATE - ((SELECT days FROM params) - 1)),
      CURRENT_DATE,
      interval '1 day'
    )::date AS day
  ),
  agg AS (
    SELECT ad.day, ad.event_type, SUM(ad.count)::integer AS cnt
    FROM public.analytics_daily ad
    WHERE ad.owner_id = auth.uid()
      AND ad.day >= (CURRENT_DATE - ((SELECT days FROM params) - 1))
    GROUP BY ad.day, ad.event_type
  )
  SELECT
    d.day,
    COALESCE((SELECT cnt FROM agg WHERE day = d.day AND event_type = 'profile_view'), 0) AS profile_views,
    COALESCE((SELECT cnt FROM agg WHERE day = d.day AND event_type = 'project_view'), 0) AS project_views,
    COALESCE((SELECT cnt FROM agg WHERE day = d.day AND event_type = 'project_click_demo'), 0) AS project_click_demo,
    COALESCE((SELECT cnt FROM agg WHERE day = d.day AND event_type = 'project_click_contact'), 0) AS project_click_contact
  FROM days d
  ORDER BY d.day;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_analytics_daily(integer) TO authenticated;

-- 7) RPC: top projects
DROP FUNCTION IF EXISTS public.get_my_top_projects(integer, integer);
CREATE OR REPLACE FUNCTION public.get_my_top_projects(p_days integer DEFAULT 7, p_limit integer DEFAULT 10)
RETURNS TABLE(
  post_id uuid,
  title text,
  views integer,
  demo_clicks integer,
  contact_clicks integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      LEAST(GREATEST(p_days, 1), 90) AS days,
      LEAST(GREATEST(p_limit, 1), 50) AS lim
  ),
  base AS (
    SELECT *
    FROM public.analytics_daily_entity ade
    WHERE ade.owner_id = auth.uid()
      AND ade.day >= (CURRENT_DATE - ((SELECT days FROM params) - 1))
      AND ade.entity_type = 'post'
  ),
  rolled AS (
    SELECT
      entity_id AS post_id,
      SUM(count) FILTER (WHERE event_type = 'project_view')::integer AS views,
      SUM(count) FILTER (WHERE event_type = 'project_click_demo')::integer AS demo_clicks,
      SUM(count) FILTER (WHERE event_type = 'project_click_contact')::integer AS contact_clicks
    FROM base
    GROUP BY entity_id
  )
  SELECT
    r.post_id,
    COALESCE(p.idea->>'title', p.content, 'Proyecto') AS title,
    COALESCE(r.views, 0) AS views,
    COALESCE(r.demo_clicks, 0) AS demo_clicks,
    COALESCE(r.contact_clicks, 0) AS contact_clicks
  FROM rolled r
  JOIN public.posts p ON p.id = r.post_id
  ORDER BY COALESCE(r.views, 0) DESC, r.post_id
  LIMIT (SELECT lim FROM params);
$$;

GRANT EXECUTE ON FUNCTION public.get_my_top_projects(integer, integer) TO authenticated;
