-- Fix: replace grant_special_badges function to use user_subscriptions instead of missing premium_subscriptions

DROP FUNCTION IF EXISTS public.grant_special_badges() CASCADE;

CREATE OR REPLACE FUNCTION public.grant_special_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.user_subscriptions us
    WHERE us.user_id = NEW.id
      AND us.status = 'active'
      AND us.current_period_end > now()
  ) THEN
    INSERT INTO public.profile_badges (
      profile_id,
      badge_type,
      badge_name,
      badge_description,
      badge_icon,
      badge_color,
      earned_date
    )
    VALUES (
      NEW.id,
      'premium',
      'Premium',
      'Usuario Premium con acceso a beneficios exclusivos',
      'crown',
      'gold',
      now()
    )
    ON CONFLICT (profile_id, badge_type) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- If there is a trigger using this function, recreate it safely
DROP TRIGGER IF EXISTS on_profile_special_badges ON public.profiles;
CREATE TRIGGER on_profile_special_badges
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_special_badges();
