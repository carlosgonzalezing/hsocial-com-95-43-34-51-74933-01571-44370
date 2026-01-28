-- Hotfix: prevent signup 500 for company accounts by ensuring auth.uid() works inside auth.users trigger

-- Ensure profiles has the columns referenced by handle_new_user
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS career text,
  ADD COLUMN IF NOT EXISTS semester text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS institution_name text,
  ADD COLUMN IF NOT EXISTS academic_role text,
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_username text;
  v_account_type text;
  v_person_status text;
  v_company_name text;
  v_slug text;
  v_company_id uuid;
BEGIN
  -- Ensure auth.uid() is available for RLS checks during this trigger execution
  PERFORM set_config('request.jwt.claim.sub', NEW.id::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'given_name',
    split_part(NEW.email, '@', 1)
  );

  v_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'person');
  IF v_account_type NOT IN ('person','company') THEN
    v_account_type := 'person';
  END IF;

  v_person_status := NULLIF(NEW.raw_user_meta_data->>'person_status', '');
  IF v_person_status IS NOT NULL AND v_person_status NOT IN ('student','professional') THEN
    v_person_status := NULL;
  END IF;

  INSERT INTO public.profiles (
    id,
    username,
    career,
    semester,
    gender,
    institution_name,
    academic_role,
    avatar_url,
    account_type,
    person_status
  ) VALUES (
    NEW.id,
    v_username,
    NEW.raw_user_meta_data->>'career',
    NEW.raw_user_meta_data->>'semester',
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'institution_name',
    NEW.raw_user_meta_data->>'academic_role',
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    v_account_type,
    v_person_status
  ) ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(v_username, profiles.username),
    career = COALESCE(NEW.raw_user_meta_data->>'career', profiles.career),
    semester = COALESCE(NEW.raw_user_meta_data->>'semester', profiles.semester),
    gender = COALESCE(NEW.raw_user_meta_data->>'gender', profiles.gender),
    institution_name = COALESCE(NEW.raw_user_meta_data->>'institution_name', profiles.institution_name),
    academic_role = COALESCE(NEW.raw_user_meta_data->>'academic_role', profiles.academic_role),
    avatar_url = COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      profiles.avatar_url
    ),
    account_type = COALESCE(NULLIF(NEW.raw_user_meta_data->>'account_type', ''), profiles.account_type),
    person_status = COALESCE(NULLIF(NEW.raw_user_meta_data->>'person_status', ''), profiles.person_status),
    updated_at = now();

  IF v_account_type = 'company' THEN
    BEGIN
      v_company_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_name', ''), v_username);

      v_slug := lower(regexp_replace(v_company_name, '[^a-zA-Z0-9]+', '-', 'g'));
      v_slug := trim(both '-' from v_slug);

      IF v_slug IS NULL OR v_slug = '' THEN
        v_slug := substring(NEW.id::text from 1 for 8);
      END IF;

      IF EXISTS (SELECT 1 FROM public.companies c WHERE c.slug = v_slug) THEN
        v_slug := v_slug || '-' || substring(NEW.id::text from 1 for 8);
      END IF;

      INSERT INTO public.companies (
        name,
        slug,
        description,
        logo_url,
        cover_url,
        website_url,
        created_by,
        status
      ) VALUES (
        v_company_name,
        v_slug,
        NULL,
        NULL,
        NULL,
        NULL,
        NEW.id,
        'active'
      )
      RETURNING id INTO v_company_id;

      INSERT INTO public.company_members (company_id, user_id, role)
      VALUES (v_company_id, NEW.id, 'admin')
      ON CONFLICT (company_id, user_id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- Do not break signup if company creation fails
        NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'on_auth_user_created'
      AND n.nspname = 'auth'
      AND c.relname = 'users'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
