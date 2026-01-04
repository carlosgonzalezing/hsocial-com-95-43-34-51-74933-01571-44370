ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS demo_category text,
  ADD COLUMN IF NOT EXISTS demo_source text,
  ADD COLUMN IF NOT EXISTS demo_readonly boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bot_label text,
  ADD COLUMN IF NOT EXISTS bot_style text;

CREATE INDEX IF NOT EXISTS posts_is_demo_created_at_idx ON public.posts(is_demo, created_at DESC);
CREATE INDEX IF NOT EXISTS profiles_is_bot_idx ON public.profiles(is_bot);

DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users insert posts optimized" ON public.posts;

CREATE POLICY "Users can insert their own posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id AND is_demo = false);
