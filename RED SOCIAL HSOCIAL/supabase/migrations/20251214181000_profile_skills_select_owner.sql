-- Add SELECT policy for profile_skills (owner-only)

ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile skills" ON public.profile_skills;

CREATE POLICY "Users can view their own profile skills" ON public.profile_skills
  FOR SELECT USING (auth.uid() = profile_id);
