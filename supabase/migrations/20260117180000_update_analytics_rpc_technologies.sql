-- Update analytics RPC to include technologies field
-- This migration updates the existing get_my_projects_analytics function to return technologies

-- Drop and recreate the function with technologies field
DROP FUNCTION IF EXISTS public.get_my_projects_analytics(integer, integer);

CREATE OR REPLACE FUNCTION public.get_my_projects_analytics(p_days integer DEFAULT 7, p_limit integer DEFAULT 50)
RETURNS TABLE(
  post_id uuid,
  title text,
  views integer,
  demo_clicks integer,
  contact_clicks integer,
  technologies text[],
  demo_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      LEAST(GREATEST(p_days, 1), 90) AS days,
      LEAST(GREATEST(p_limit, 1), 200) AS lim
  ),
  my_projects AS (
    SELECT p.id
    FROM public.posts p
    WHERE p.user_id = auth.uid()
      AND p.post_type = 'project'
    ORDER BY p.created_at DESC
    LIMIT (SELECT lim FROM params)
  ),
  base AS (
    SELECT *
    FROM public.analytics_daily_entity ade
    WHERE ade.owner_id = auth.uid()
      AND ade.day >= (CURRENT_DATE - ((SELECT days FROM params) - 1))
      AND ade.entity_type = 'post'
      AND ade.entity_id IN (SELECT id FROM my_projects)
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
    mp.id AS post_id,
    COALESCE(p.idea->>'title', p.content, 'Proyecto') AS title,
    COALESCE(r.views, 0) AS views,
    COALESCE(r.demo_clicks, 0) AS demo_clicks,
    COALESCE(r.contact_clicks, 0) AS contact_clicks,
    p.technologies,
    p.demo_url
  FROM my_projects mp
  JOIN public.posts p ON p.id = mp.id
  LEFT JOIN rolled r ON r.post_id = mp.id
  ORDER BY COALESCE(r.views, 0) DESC, mp.id;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_projects_analytics(integer, integer) TO authenticated;
