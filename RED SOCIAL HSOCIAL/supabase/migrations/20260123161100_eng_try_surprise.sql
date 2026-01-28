CREATE TABLE IF NOT EXISTS public.eng_surprise_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT CURRENT_DATE,
  source_event text NOT NULL,
  entity_type text,
  entity_id uuid,
  awarded_points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eng_surprise_rewards_user_day ON public.eng_surprise_rewards(user_id, day);

ALTER TABLE public.eng_surprise_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eng_surprise_rewards_read_own" ON public.eng_surprise_rewards;
DROP POLICY IF EXISTS "eng_surprise_rewards_no_write" ON public.eng_surprise_rewards;

CREATE POLICY "eng_surprise_rewards_read_own"
ON public.eng_surprise_rewards
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "eng_surprise_rewards_no_write"
ON public.eng_surprise_rewards
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

DROP FUNCTION IF EXISTS public.eng_try_surprise(text, text, uuid);
CREATE OR REPLACE FUNCTION public.eng_try_surprise(
  p_source_event text,
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
  v_today date := CURRENT_DATE;
  v_count_today integer;
  v_seed text;
  v_roll integer;
  v_award integer := 0;
  v_total_points integer;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active session');
  END IF;

  SELECT COUNT(*) INTO v_count_today
  FROM public.eng_surprise_rewards
  WHERE user_id = v_actor AND day = v_today;

  IF v_count_today >= 3 THEN
    RETURN jsonb_build_object('success', true, 'awarded', 0, 'reason', 'daily_cap');
  END IF;

  v_seed := v_actor::text || ':' || COALESCE(p_entity_id::text, '') || ':' || v_today::text;
  v_roll := (('x' || substr(md5(v_seed), 1, 8))::bit(32)::int % 100);

  IF v_roll < 15 THEN
    v_award := 10;

    INSERT INTO public.eng_points_ledger(user_id, event_type, points, entity_type, entity_id)
    VALUES (v_actor, 'surprise_bonus', v_award, p_entity_type, p_entity_id);

    INSERT INTO public.eng_user_stats(user_id)
    VALUES (v_actor)
    ON CONFLICT (user_id) DO NOTHING;

    UPDATE public.eng_user_stats
    SET total_points = total_points + v_award,
        level = public.eng_calc_level(total_points + v_award),
        updated_at = now()
    WHERE user_id = v_actor
    RETURNING total_points INTO v_total_points;

    INSERT INTO public.profile_badges(profile_id, badge_type, badge_name, badge_description, badge_icon, badge_color, earned_date, is_active)
    VALUES (v_actor, 'achievement', 'Sorpresa', '¡Recompensa sorpresa por tu actividad!', 'zap', 'primary', now(), true)
    ON CONFLICT (profile_id, badge_type) DO NOTHING;
  ELSE
    SELECT total_points INTO v_total_points
    FROM public.eng_user_stats
    WHERE user_id = v_actor;
  END IF;

  INSERT INTO public.eng_surprise_rewards(user_id, day, source_event, entity_type, entity_id, awarded_points)
  VALUES (v_actor, v_today, COALESCE(p_source_event, ''), p_entity_type, p_entity_id, v_award);

  RETURN jsonb_build_object(
    'success', true,
    'awarded', v_award,
    'roll', v_roll,
    'total_points', COALESCE(v_total_points, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.eng_try_surprise(text, text, uuid) TO authenticated;
