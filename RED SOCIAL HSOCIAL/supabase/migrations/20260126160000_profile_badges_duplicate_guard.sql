-- Fix: prevent duplicate profile_badges inserts from breaking post/project creation
-- Some legacy triggers/functions may INSERT without ON CONFLICT, which can violate
-- unique constraint profile_badges_profile_id_badge_type_key.

CREATE OR REPLACE FUNCTION public.prevent_duplicate_profile_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.profile_badges pb
    WHERE pb.profile_id = NEW.profile_id
      AND pb.badge_type = NEW.badge_type
  ) THEN
    -- Cancel insert silently
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_badges_prevent_duplicates ON public.profile_badges;
CREATE TRIGGER profile_badges_prevent_duplicates
BEFORE INSERT ON public.profile_badges
FOR EACH ROW
EXECUTE FUNCTION public.prevent_duplicate_profile_badges();

GRANT EXECUTE ON FUNCTION public.prevent_duplicate_profile_badges() TO authenticated;
