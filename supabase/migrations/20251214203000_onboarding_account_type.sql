-- Onboarding step 2: account type (person vs company) + person status

-- 1) Extend profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'person' CHECK (account_type IN ('person','company')),
ADD COLUMN IF NOT EXISTS person_status text CHECK (person_status IN ('student','professional', NULL));

-- 2) Update handle_new_user trigger to persist metadata and auto-create company for company accounts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_username text;
  v_account_type text;
  v_person_status text;
  v_company_name text;
  v_slug text;
  v_company_id uuid;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'given_name',
    SPLIT_PART(NEW.email, '@', 1)
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
    v_company_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_name', ''), v_username);

    v_slug := lower(regexp_replace(v_company_name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := trim(both '-' from v_slug);

    -- Ensure slug uniqueness (append user id prefix when needed)
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
  END IF;

  RETURN NEW;
END;
$$;
