-- Backfill: create missing profile rows for existing auth.users

INSERT INTO public.profiles (id, username, created_at, updated_at)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data->>'username',''), split_part(u.email, '@', 1), 'Usuario') AS username,
  now() AS created_at,
  now() AS updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
