-- Fix: ensure ON CONFLICT target exists for profile_badges upsert in grant_premium_badge trigger

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'profile_badges'
  ) THEN
    -- Needed for: ON CONFLICT (profile_id, badge_type)
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS profile_badges_profile_id_badge_type_key ON public.profile_badges (profile_id, badge_type)';
  END IF;
END $$;
