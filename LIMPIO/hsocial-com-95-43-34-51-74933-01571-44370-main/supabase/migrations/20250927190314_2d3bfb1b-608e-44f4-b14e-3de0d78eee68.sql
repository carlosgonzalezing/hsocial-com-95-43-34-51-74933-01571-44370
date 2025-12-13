-- Actualizar el trigger handle_new_user para mejor manejo de OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Extraer datos del usuario de Google OAuth, Outlook OAuth o registro manual
  INSERT INTO public.profiles (
    id,
    username,
    career,
    semester,
    gender,
    institution_name,
    academic_role,
    avatar_url
  ) VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'given_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'career',
    NEW.raw_user_meta_data->>'semester',
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'institution_name',
    NEW.raw_user_meta_data->>'academic_role',
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  ) ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'given_name',
      SPLIT_PART(NEW.email, '@', 1),
      profiles.username
    ),
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
    updated_at = now();
  
  RETURN NEW;
END;
$$;