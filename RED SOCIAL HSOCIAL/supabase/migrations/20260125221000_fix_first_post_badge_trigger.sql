-- Fix: Create idempotent trigger for first_post badge to avoid duplicate key errors
-- This replaces any existing trigger that might be causing the duplicate key violation

-- Function to grant first_post badge (idempotent)
CREATE OR REPLACE FUNCTION public.grant_first_post_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    -- Check if this is the first post for the user
    -- Only grant badge if user has exactly 1 post (including the one being inserted)
    IF (
      SELECT COUNT(*) 
      FROM public.posts 
      WHERE user_id = NEW.user_id
    ) = 1 THEN
      INSERT INTO public.profile_badges (
        profile_id,
        badge_type,
        badge_name,
        badge_description,
        badge_icon,
        badge_color,
        earned_date,
        is_active
      )
      VALUES (
        NEW.user_id,
        'first_post',
        'Primera Publicación',
        '¡Compartiste tu primera idea con la comunidad!',
        'trophy',
        'gold',
        now(),
        true
      )
      ON CONFLICT (profile_id, badge_type) DO NOTHING;
    END IF;
  EXCEPTION
    WHEN unique_violation THEN
      -- Badge already exists; never block post insert
      NULL;
  END;

  RETURN NEW;
END;
$$;

-- Drop any existing trigger and create the new one
DROP TRIGGER IF EXISTS on_post_insert_first_post_badge ON public.posts;
CREATE TRIGGER on_post_insert_first_post_badge
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_first_post_badge();
