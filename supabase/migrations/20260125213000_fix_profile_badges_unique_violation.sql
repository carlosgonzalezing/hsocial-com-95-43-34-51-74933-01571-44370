-- Fix: make profile_badges award triggers fully idempotent (avoid duplicate key errors)

-- Premium badge trigger (safe / idempotent)
CREATE OR REPLACE FUNCTION public.grant_premium_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
        earned_date,
        is_active
      )
      VALUES (
        NEW.id,
        'premium',
        'Premium',
        'Usuario Premium con acceso a beneficios exclusivos',
        'crown',
        'gold',
        now(),
        true
      )
      ON CONFLICT (profile_id, badge_type) DO NOTHING;
    END IF;
  EXCEPTION
    WHEN unique_violation THEN
      -- Badge already exists; never block profile insert/update
      NULL;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_create_badge ON public.profiles;
CREATE TRIGGER on_profile_create_badge
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_premium_badge();

-- Special badges trigger (also safe / idempotent)
CREATE OR REPLACE FUNCTION public.grant_special_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    -- Keep current behavior: for now, mirrors premium badge granting if user is premium
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
        earned_date,
        is_active
      )
      VALUES (
        NEW.id,
        'premium',
        'Premium',
        'Usuario Premium con acceso a beneficios exclusivos',
        'crown',
        'gold',
        now(),
        true
      )
      ON CONFLICT (profile_id, badge_type) DO NOTHING;
    END IF;
  EXCEPTION
    WHEN unique_violation THEN
      NULL;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_special_badges ON public.profiles;
CREATE TRIGGER on_profile_special_badges
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_special_badges();
