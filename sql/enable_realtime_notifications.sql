-- ==============================================
-- NOTIFICACIONES EN TIEMPO REAL
-- ==============================================
-- Ejecuta este script en el Editor SQL de Supabase (Cloud -> SQL Editor)
-- Este script habilita notificaciones automáticas para likes, comentarios y menciones

-- 1. Asegurar que la tabla notifications existe
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT valid_notification_type CHECK (
    type IN (
      'friend_request', 'message', 'like', 'new_post', 
      'post_like', 'post_comment', 'comment_reply', 
      'friend_accepted', 'mention', 'profile_heart_received',
      'engagement_hearts_earned', 'hearts_daily_summary'
    )
  )
);

-- 2. Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Crear/actualizar políticas
DROP POLICY IF EXISTS "Users can view received notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update received notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

CREATE POLICY "Users can view received notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = receiver_id);

CREATE POLICY "Users can update received notifications" 
ON public.notifications FOR UPDATE 
TO authenticated 
USING (auth.uid() = receiver_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = receiver_id);

-- 4. Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_id ON public.notifications(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON public.notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read) WHERE read = false;

-- 5. CRÍTICO: Habilitar realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Agregar tabla a realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- 6. Función para crear notificaciones (evita duplicados)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_type TEXT,
  p_sender_id UUID,
  p_receiver_id UUID,
  p_post_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- No crear notificación si sender es receiver
  IF p_sender_id = p_receiver_id THEN
    RETURN NULL;
  END IF;

  -- Verificar duplicados recientes (últimos 5 minutos)
  SELECT id INTO v_notification_id
  FROM public.notifications
  WHERE type = p_type
    AND sender_id = p_sender_id
    AND receiver_id = p_receiver_id
    AND COALESCE(post_id::text, '') = COALESCE(p_post_id::text, '')
    AND COALESCE(comment_id::text, '') = COALESCE(p_comment_id::text, '')
    AND created_at > now() - INTERVAL '5 minutes'
  LIMIT 1;

  IF v_notification_id IS NOT NULL THEN
    RETURN v_notification_id;
  END IF;

  -- Crear nueva notificación
  INSERT INTO public.notifications (
    type, sender_id, receiver_id, post_id, comment_id, message
  ) VALUES (
    p_type, p_sender_id, p_receiver_id, p_post_id, p_comment_id, p_message
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- 7. Trigger para notificar likes en posts
CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
BEGIN
  SELECT user_id INTO v_post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;

  IF v_post_author_id IS NOT NULL AND v_post_author_id != NEW.user_id THEN
    PERFORM public.create_notification(
      'post_like',
      NEW.user_id,
      v_post_author_id,
      NEW.post_id,
      NULL,
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 8. Trigger para notificar comentarios
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
  v_parent_comment_author_id UUID;
BEGIN
  SELECT user_id INTO v_post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;

  -- Si es respuesta a comentario
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO v_parent_comment_author_id
    FROM public.comments
    WHERE id = NEW.parent_id;

    IF v_parent_comment_author_id IS NOT NULL 
       AND v_parent_comment_author_id != NEW.user_id 
       AND v_parent_comment_author_id != v_post_author_id THEN
      PERFORM public.create_notification(
        'comment_reply',
        NEW.user_id,
        v_parent_comment_author_id,
        NEW.post_id,
        NEW.id,
        NULL
      );
    END IF;
  END IF;

  -- Notificar al autor del post
  IF v_post_author_id IS NOT NULL AND v_post_author_id != NEW.user_id THEN
    PERFORM public.create_notification(
      'post_comment',
      NEW.user_id,
      v_post_author_id,
      NEW.post_id,
      NEW.id,
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 9. Trigger para notificar menciones
CREATE OR REPLACE FUNCTION public.notify_comment_mentions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mention_pattern TEXT := '@\[([^\]]+)\]\(([^)]+)\)';
  v_matches TEXT[];
  v_user_id UUID;
BEGIN
  FOR v_matches IN 
    SELECT regexp_matches(NEW.content, v_mention_pattern, 'g')
  LOOP
    v_user_id := v_matches[2]::UUID;
    
    IF v_user_id IS NOT NULL AND v_user_id != NEW.user_id THEN
      PERFORM public.create_notification(
        'mention',
        NEW.user_id,
        v_user_id,
        NEW.post_id,
        NEW.id,
        NULL
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- 10. Eliminar triggers existentes
DROP TRIGGER IF EXISTS trigger_notify_post_like ON public.post_reactions;
DROP TRIGGER IF EXISTS trigger_notify_post_comment ON public.comments;
DROP TRIGGER IF EXISTS trigger_notify_comment_mentions ON public.comments;

-- 11. Crear triggers
CREATE TRIGGER trigger_notify_post_like
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  WHEN (NEW.reaction_type = 'heart')
  EXECUTE FUNCTION public.notify_post_like();

CREATE TRIGGER trigger_notify_post_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_comment();

CREATE TRIGGER trigger_notify_comment_mentions
  AFTER INSERT OR UPDATE OF content ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_mentions();

-- 12. Función para marcar notificaciones como leídas
CREATE OR REPLACE FUNCTION public.mark_notifications_read(notification_ids UUID[] DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF notification_ids IS NULL THEN
    UPDATE public.notifications
    SET read = true
    WHERE receiver_id = auth.uid() AND read = false;
  ELSE
    UPDATE public.notifications
    SET read = true
    WHERE id = ANY(notification_ids)
      AND receiver_id = auth.uid()
      AND read = false;
  END IF;
END;
$$;

-- 13. Permisos
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notifications_read TO authenticated;

-- ✅ LISTO! Las notificaciones en tiempo real están configuradas
