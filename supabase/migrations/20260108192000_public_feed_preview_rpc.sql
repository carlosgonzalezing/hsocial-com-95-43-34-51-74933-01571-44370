  -- Public feed preview RPC (limited) + restrict posts SELECT to authenticated

  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'posts'
        AND column_name = 'media_urls'
        AND udt_name = 'jsonb'
    ) THEN
      EXECUTE 'ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_urls_tmp text[]';

      EXECUTE '
        UPDATE public.posts
        SET media_urls_tmp =
          CASE
            WHEN media_urls IS NULL THEN NULL
            WHEN jsonb_typeof(media_urls) <> ''array'' THEN NULL
            ELSE ARRAY(
              SELECT jsonb_array_elements_text(media_urls)
            )
          END
      ';

      EXECUTE 'ALTER TABLE public.posts DROP COLUMN media_urls';
      EXECUTE 'ALTER TABLE public.posts RENAME COLUMN media_urls_tmp TO media_urls';
    END IF;
  END $$;

  -- 1) Ensure posts SELECT is not available to anon
  DROP POLICY IF EXISTS "Users can view public posts, their own, group posts, and company posts" ON public.posts;

  CREATE POLICY "Users can view public posts, their own, group posts, and company posts" ON public.posts
    FOR SELECT
    TO authenticated
    USING (
      visibility = 'public'::post_visibility
      OR user_id = auth.uid()
      OR (group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = posts.group_id
          AND gm.user_id = auth.uid()
      ))
      OR (company_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.company_members cm
        WHERE cm.company_id = posts.company_id
          AND cm.user_id = auth.uid()
      ))
    );

  -- 2) Limited public preview for landing page
  DROP FUNCTION IF EXISTS public.get_public_feed_preview(integer);

  CREATE OR REPLACE FUNCTION public.get_public_feed_preview(limit_count integer DEFAULT 5)
  RETURNS TABLE(
    id uuid,
    content text,
    user_id uuid,
    group_id uuid,
    company_id uuid,
    visibility post_visibility,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    media_url text,
    media_urls text[],
    media_type text,
    post_type text,
    shared_post_id uuid,
    shared_from text,
    is_demo boolean,
    demo_category text,
    demo_source text,
    demo_readonly boolean,
    profiles jsonb,
    comments_count bigint,
    reactions_count bigint
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
  AS $$
    SELECT
      p.id,
      p.content,
      p.user_id,
      p.group_id,
      p.company_id,
      p.visibility,
      p.created_at,
      p.updated_at,
      p.media_url,
      p.media_urls,
      p.media_type,
      p.post_type,
      p.shared_post_id,
      p.shared_from,
      p.is_demo,
      p.demo_category,
      p.demo_source,
      p.demo_readonly,
      jsonb_build_object(
        'id', pr.id,
        'username', pr.username,
        'avatar_url', pr.avatar_url,
        'career', pr.career
      ) as profiles,
      COALESCE(c.comments_count, 0) as comments_count,
      COALESCE(r.reactions_count, 0) as reactions_count
    FROM public.posts p
    JOIN public.profiles pr ON pr.id = p.user_id
    LEFT JOIN (
      SELECT post_id, COUNT(*)::bigint AS comments_count
      FROM public.comments
      GROUP BY post_id
    ) c ON c.post_id = p.id
    LEFT JOIN (
      SELECT post_id, COUNT(*)::bigint AS reactions_count
      FROM public.reactions
      GROUP BY post_id
    ) r ON r.post_id = p.id
    WHERE p.visibility = 'public'::post_visibility
      AND p.group_id IS NULL
      AND p.company_id IS NULL
    ORDER BY p.created_at DESC
    LIMIT LEAST(GREATEST(limit_count, 1), 5);
  $$;

  GRANT EXECUTE ON FUNCTION public.get_public_feed_preview(integer) TO anon, authenticated;
