-- Beta hardening: enforce idea acceptance by owner + safer channel membership

-- 1) idea_participants: only idea owner can accept (insert)
ALTER TABLE public.idea_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can join ideas" ON public.idea_participants;

DROP POLICY IF EXISTS "Idea owners can add participants" ON public.idea_participants;
CREATE POLICY "Idea owners can add participants" ON public.idea_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = idea_participants.post_id
      AND p.user_id = auth.uid()
  )
);

-- keep existing SELECT policy as-is (if present) and allow participants to leave their idea

-- 2) miembros_canal: prevent self-joining private channels without invitation
ALTER TABLE public.miembros_canal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can add members to channels" ON public.miembros_canal;

DROP POLICY IF EXISTS "Channel members can add members" ON public.miembros_canal;
CREATE POLICY "Channel members can add members" ON public.miembros_canal
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    -- allow creating the first membership row for a newly-created channel
    (
      miembros_canal.id_usuario = auth.uid()
      AND NOT EXISTS (
        SELECT 1
        FROM public.miembros_canal mc0
        WHERE mc0.id_canal = miembros_canal.id_canal
      )
    )
    OR
    -- allow existing members to add new members (invites)
    EXISTS (
      SELECT 1
      FROM public.miembros_canal mc2
      WHERE mc2.id_canal = miembros_canal.id_canal
        AND mc2.id_usuario = auth.uid()
    )
  )
);
