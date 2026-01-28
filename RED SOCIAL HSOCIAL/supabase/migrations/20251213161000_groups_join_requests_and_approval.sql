CREATE TABLE IF NOT EXISTS public.feature_flags (
  key TEXT PRIMARY KEY,
  value BOOLEAN NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Feature flags are readable" ON public.feature_flags;
CREATE POLICY "Feature flags are readable"
ON public.feature_flags
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Feature flags are immutable" ON public.feature_flags;
CREATE POLICY "Feature flags are immutable"
ON public.feature_flags
FOR ALL
USING (false);

INSERT INTO public.feature_flags(key, value)
VALUES ('requires_group_creation_approval', false)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_feature_flag(flag_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT value FROM public.feature_flags WHERE key = flag_key), false);
$$;

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  cover_url TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  category TEXT,
  tags TEXT[],
  rules TEXT,
  type TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS group_id UUID;

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS type TEXT;

ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS status TEXT;

UPDATE public.groups
SET type = COALESCE(type, CASE WHEN slug = 'red-h' THEN 'official' ELSE 'community' END),
    status = COALESCE(status, 'active')
WHERE type IS NULL OR status IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'groups_type_check'
  ) THEN
    ALTER TABLE public.groups
    ADD CONSTRAINT groups_type_check
    CHECK (type IN ('official', 'project', 'community'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'groups_status_check'
  ) THEN
    ALTER TABLE public.groups
    ADD CONSTRAINT groups_status_check
    CHECK (status IN ('active', 'pending_approval', 'rejected'));
  END IF;
END $$;

ALTER TABLE public.groups
ALTER COLUMN type SET NOT NULL;

ALTER TABLE public.groups
ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.groups
ALTER COLUMN type SET DEFAULT 'community';

ALTER TABLE public.groups
ALTER COLUMN status SET DEFAULT 'active';

DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON public.groups;
DROP POLICY IF EXISTS "Private groups are viewable by members only" ON public.groups;
DROP POLICY IF EXISTS "Optimized public groups view" ON public.groups;

DROP POLICY IF EXISTS "Active groups are viewable" ON public.groups;
DROP POLICY IF EXISTS "Non-active groups are viewable by creator" ON public.groups;
DROP POLICY IF EXISTS "Users can create non-official groups" ON public.groups;

CREATE POLICY "Active groups are viewable"
ON public.groups
FOR SELECT
USING (
  status = 'active'
  AND (
    NOT is_private
    OR EXISTS (
      SELECT 1
      FROM public.group_members
      WHERE group_id = id AND user_id = auth.uid()
    )
  )
);

CREATE POLICY "Non-active groups are viewable by creator"
ON public.groups
FOR SELECT
USING (
  status <> 'active'
  AND (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1
      FROM public.group_members
      WHERE group_id = id AND user_id = auth.uid() AND role IN ('admin','moderator')
    )
  )
);

DROP POLICY IF EXISTS "Users can create groups" ON public.groups;

CREATE POLICY "Users can create non-official groups"
ON public.groups
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND type IN ('project', 'community')
  AND (
    (public.get_feature_flag('requires_group_creation_approval') = true AND status = 'pending_approval')
    OR (public.get_feature_flag('requires_group_creation_approval') = false AND status = 'active')
  )
);

CREATE TABLE IF NOT EXISTS public.group_join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  decided_at TIMESTAMP WITH TIME ZONE,
  decided_by UUID REFERENCES public.profiles(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_group_join_requests_pending_unique
ON public.group_join_requests(group_id, user_id)
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_group_join_requests_group_status
ON public.group_join_requests(group_id, status, created_at);

ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their join requests" ON public.group_join_requests;
CREATE POLICY "Users can view their join requests"
ON public.group_join_requests
FOR SELECT
USING (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Group managers can view join requests" ON public.group_join_requests;
CREATE POLICY "Group managers can view join requests"
ON public.group_join_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = group_join_requests.group_id
      AND user_id = auth.uid()
      AND role IN ('admin','moderator')
  )
);

DROP POLICY IF EXISTS "Users can create join requests" ON public.group_join_requests;
CREATE POLICY "Users can create join requests"
ON public.group_join_requests
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = group_id
      AND g.status = 'active'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = group_id AND gm.user_id = user_id
  )
);

DROP POLICY IF EXISTS "Group posts are viewable by group members" ON public.posts;
DROP POLICY IF EXISTS "Group members can create posts in their groups" ON public.posts;
DROP POLICY IF EXISTS "Users can view public posts and their own" ON public.posts;
DROP POLICY IF EXISTS "View public and own posts" ON public.posts;
DROP POLICY IF EXISTS "Los usuarios pueden ver posts públicos y los suyos" ON public.posts;

DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden crear posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;

CREATE POLICY "Users can view posts with group access" ON public.posts
FOR SELECT
USING (
  group_id IS NULL
  OR EXISTS (
    SELECT 1
    FROM public.group_members gm
    JOIN public.groups g ON g.id = gm.group_id
    WHERE gm.group_id = posts.group_id
      AND gm.user_id = (SELECT auth.uid())
      AND g.status = 'active'
  )
);

CREATE POLICY "Users can create posts with group access" ON public.posts
FOR INSERT
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND (
    group_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.group_members gm
      JOIN public.groups g ON g.id = gm.group_id
      WHERE gm.group_id = posts.group_id
        AND gm.user_id = (SELECT auth.uid())
        AND g.status = 'active'
    )
  )
);

DROP POLICY IF EXISTS "Users can cancel join requests" ON public.group_join_requests;
CREATE POLICY "Users can cancel join requests"
ON public.group_join_requests
FOR DELETE
USING (
  auth.uid() = user_id AND status = 'pending'
);

DROP POLICY IF EXISTS "Users can join public groups" ON public.group_members;

DROP POLICY IF EXISTS "Approved join request can insert member" ON public.group_members;
CREATE POLICY "Approved join request can insert member"
ON public.group_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.group_join_requests r
    WHERE r.group_id = group_members.group_id
      AND r.user_id = group_members.user_id
      AND r.status = 'approved'
  )
);

CREATE OR REPLACE FUNCTION public.request_to_join_group(
  group_id_param UUID,
  message_param TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS(
    SELECT 1 FROM public.groups g
    WHERE g.id = group_id_param AND g.status = 'active'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Grupo no disponible');
  END IF;

  IF EXISTS(
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_id_param AND gm.user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ya eres miembro del grupo');
  END IF;

  IF EXISTS(
    SELECT 1 FROM public.group_join_requests r
    WHERE r.group_id = group_id_param AND r.user_id = auth.uid() AND r.status = 'pending'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ya tienes una solicitud pendiente');
  END IF;

  INSERT INTO public.group_join_requests(group_id, user_id, status, message)
  VALUES (group_id_param, auth.uid(), 'pending', message_param);

  result := jsonb_build_object('success', true, 'message', 'Solicitud enviada');
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_to_group_join_request(
  request_id_param UUID,
  approve_param BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  req RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO req
  FROM public.group_join_requests
  WHERE id = request_id_param;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solicitud no encontrada');
  END IF;

  IF req.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'La solicitud ya fue procesada');
  END IF;

  IF NOT EXISTS(
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = req.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('admin','moderator')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'No autorizado');
  END IF;

  IF approve_param THEN
    INSERT INTO public.group_members(group_id, user_id, role)
    VALUES (req.group_id, req.user_id, 'member')
    ON CONFLICT (group_id, user_id) DO NOTHING;

    UPDATE public.group_join_requests
    SET status = 'approved', decided_at = now(), decided_by = auth.uid()
    WHERE id = request_id_param;

    UPDATE public.groups
    SET member_count = (SELECT COUNT(*) FROM public.group_members WHERE group_id = req.group_id)
    WHERE id = req.group_id;

    RETURN jsonb_build_object('success', true, 'message', 'Solicitud aprobada');
  END IF;

  UPDATE public.group_join_requests
  SET status = 'rejected', decided_at = now(), decided_by = auth.uid()
  WHERE id = request_id_param;

  RETURN jsonb_build_object('success', true, 'message', 'Solicitud rechazada');
END;
$$;

DROP FUNCTION IF EXISTS public.create_group_atomic(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT[], TEXT, UUID);
CREATE OR REPLACE FUNCTION public.create_group_atomic(
  group_name TEXT,
  group_description TEXT,
  group_slug TEXT,
  is_private BOOLEAN,
  category TEXT,
  tags TEXT[],
  rules TEXT,
  creator_id UUID,
  group_type TEXT DEFAULT 'community'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_group_id UUID;
  result JSONB;
  group_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF creator_id <> auth.uid() THEN
    RAISE EXCEPTION 'creator_id must match auth user';
  END IF;

  IF group_type NOT IN ('project','community') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tipo de grupo inválido');
  END IF;

  IF EXISTS(SELECT 1 FROM public.groups WHERE slug = group_slug) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'El nombre del grupo ya está en uso'
    );
  END IF;

  IF public.get_feature_flag('requires_group_creation_approval') THEN
    group_status := 'pending_approval';
  ELSE
    group_status := 'active';
  END IF;

  INSERT INTO public.groups (
    name, description, slug, is_private, category, tags, rules, created_by, type, status
  ) VALUES (
    group_name, group_description, group_slug, is_private, category, tags, rules, creator_id, group_type, group_status
  ) RETURNING id INTO new_group_id;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (new_group_id, creator_id, 'admin');

  UPDATE public.groups
  SET member_count = 1
  WHERE id = new_group_id;

  SELECT jsonb_build_object(
    'success', true,
    'group_id', new_group_id,
    'status', group_status,
    'message', 'Grupo creado exitosamente'
  ) INTO result;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

DROP FUNCTION IF EXISTS public.get_public_groups(integer);
CREATE OR REPLACE FUNCTION public.get_public_groups(limit_count integer DEFAULT 20)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  slug text,
  avatar_url text,
  is_private boolean,
  created_at timestamp with time zone,
  member_count bigint,
  post_count bigint,
  category text,
  tags text[],
  type text,
  status text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    g.id,
    g.name,
    g.description,
    g.slug,
    g.avatar_url,
    g.is_private,
    g.created_at,
    COALESCE(mc.member_count, 0) as member_count,
    COALESCE(pc.post_count, 0) as post_count,
    g.category,
    g.tags,
    g.type,
    g.status
  FROM public.groups g
  LEFT JOIN (
    SELECT group_id, COUNT(*) as member_count
    FROM public.group_members
    GROUP BY group_id
  ) mc ON g.id = mc.group_id
  LEFT JOIN (
    SELECT group_id, COUNT(*) as post_count
    FROM public.posts
    WHERE group_id IS NOT NULL AND visibility = 'public'
    GROUP BY group_id
  ) pc ON g.id = pc.group_id
  WHERE g.is_private = false
    AND g.status = 'active'
  ORDER BY g.created_at DESC
  LIMIT limit_count;
$$;

DROP FUNCTION IF EXISTS public.get_user_groups(uuid);
CREATE OR REPLACE FUNCTION public.get_user_groups(user_id_param uuid)
RETURNS TABLE(
  group_id uuid,
  role text,
  joined_at timestamp with time zone,
  group_name text,
  group_description text,
  group_slug text,
  group_avatar_url text,
  is_private boolean,
  created_at timestamp with time zone,
  member_count bigint,
  post_count bigint,
  type text,
  status text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    gm.group_id,
    gm.role,
    gm.joined_at,
    g.name as group_name,
    g.description as group_description,
    g.slug as group_slug,
    g.avatar_url as group_avatar_url,
    g.is_private,
    g.created_at,
    COALESCE(mc.member_count, 0) as member_count,
    COALESCE(pc.post_count, 0) as post_count,
    g.type,
    g.status
  FROM public.group_members gm
  JOIN public.groups g ON gm.group_id = g.id
  LEFT JOIN (
    SELECT group_id, COUNT(*) as member_count
    FROM public.group_members
    GROUP BY group_id
  ) mc ON g.id = mc.group_id
  LEFT JOIN (
    SELECT group_id, COUNT(*) as post_count
    FROM public.posts
    WHERE group_id IS NOT NULL AND visibility = 'public'
    GROUP BY group_id
  ) pc ON g.id = pc.group_id
  WHERE gm.user_id = user_id_param;
$$;

DROP FUNCTION IF EXISTS public.get_group_by_slug_or_id(text);
CREATE OR REPLACE FUNCTION public.get_group_by_slug_or_id(slug_or_id_param text)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  slug text,
  avatar_url text,
  is_private boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  created_by uuid,
  category text,
  tags text[],
  rules text,
  cover_url text,
  post_count bigint,
  member_count bigint,
  created_by_username text,
  created_by_avatar_url text,
  type text,
  status text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    g.id,
    g.name,
    g.description,
    g.slug,
    g.avatar_url,
    g.is_private,
    g.created_at,
    g.updated_at,
    g.created_by,
    g.category,
    g.tags,
    g.rules,
    g.cover_url,
    COALESCE(pc.post_count, 0) as post_count,
    COALESCE(mc.member_count, 0) as member_count,
    p.username as created_by_username,
    p.avatar_url as created_by_avatar_url,
    g.type,
    g.status
  FROM public.groups g
  LEFT JOIN (
    SELECT group_id, COUNT(*) as member_count
    FROM public.group_members
    GROUP BY group_id
  ) mc ON g.id = mc.group_id
  LEFT JOIN (
    SELECT 
      g2.id as group_id,
      COUNT(posts.id) as post_count
    FROM public.groups g2
    LEFT JOIN public.posts ON posts.group_id = g2.id AND posts.visibility = 'public'
    GROUP BY g2.id
  ) pc ON g.id = pc.group_id
  LEFT JOIN public.profiles p ON g.created_by = p.id
  WHERE (g.slug = slug_or_id_param OR g.id::text = slug_or_id_param)
    AND (
      (
        g.status = 'active'
        AND (
          NOT g.is_private
          OR EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = g.id AND gm.user_id = auth.uid()
          )
        )
      )
      OR (
        g.status <> 'active'
        AND (
          auth.uid() = g.created_by
          OR EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = g.id AND gm.user_id = auth.uid() AND gm.role IN ('admin','moderator')
          )
        )
      )
    )
  LIMIT 1;
$$;
