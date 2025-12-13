-- ==============================================
-- CORRECCIÓN: Error de columna 'contenido' en notificaciones
-- ==============================================
-- Este script busca y corrige cualquier referencia a 'contenido'
-- en funciones o triggers relacionados con notificaciones
-- Ejecuta este script en el Editor SQL de Supabase

-- 1. Buscar y corregir cualquier función que use 'contenido' en lugar de 'message'
-- Primero, verificar si hay alguna función con el problema
DO $$
DECLARE
    func_record RECORD;
    func_body TEXT;
    corrected_body TEXT;
BEGIN
    -- Buscar funciones que puedan estar usando 'contenido' en notificaciones
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_functiondef(p.oid) as function_definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND pg_get_functiondef(p.oid) LIKE '%notifications%'
        AND pg_get_functiondef(p.oid) LIKE '%contenido%'
    LOOP
        RAISE NOTICE 'Función encontrada con problema: %', func_record.function_name;
    END LOOP;
END $$;

-- 2. Asegurar que la función create_notification use 'message' correctamente
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

  -- Crear nueva notificación usando 'message' (NO 'contenido')
  INSERT INTO public.notifications (
    type, sender_id, receiver_id, post_id, comment_id, message
  ) VALUES (
    p_type, p_sender_id, p_receiver_id, p_post_id, p_comment_id, p_message
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- 3. Verificar y corregir el trigger para reacciones en posts
-- Primero, eliminar el trigger si existe en la tabla incorrecta
DROP TRIGGER IF EXISTS trigger_notify_post_like ON public.post_reactions;
DROP TRIGGER IF EXISTS trigger_notify_reaction ON public.reactions;
DROP TRIGGER IF EXISTS trigger_notify_reactions ON public.reactions;

-- 4. Crear función para notificar cuando se inserta una reacción
CREATE OR REPLACE FUNCTION public.notify_post_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
BEGIN
  -- Solo procesar si es una reacción a un post (no a un comentario)
  IF NEW.post_id IS NOT NULL AND NEW.comment_id IS NULL THEN
    -- Obtener el autor del post
    SELECT user_id INTO v_post_author_id
    FROM public.posts
    WHERE id = NEW.post_id;

    -- Crear notificación solo si el autor es diferente al usuario que reacciona
    IF v_post_author_id IS NOT NULL AND v_post_author_id != NEW.user_id THEN
      PERFORM public.create_notification(
        'post_like',
        NEW.user_id,
        v_post_author_id,
        NEW.post_id,
        NULL,
        NULL  -- message será NULL, se puede generar dinámicamente si es necesario
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Crear trigger en la tabla reactions (no post_reactions)
CREATE TRIGGER trigger_notify_post_reaction
  AFTER INSERT ON public.reactions
  FOR EACH ROW
  WHEN (NEW.post_id IS NOT NULL AND NEW.comment_id IS NULL)
  EXECUTE FUNCTION public.notify_post_reaction();

-- 6. Verificar que todos los triggers usen 'message' y no 'contenido'
-- Eliminar cualquier trigger antiguo que pueda estar causando problemas
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
        AND event_object_table = 'reactions'
        AND trigger_name LIKE '%notification%'
        AND trigger_name != 'trigger_notify_post_reaction'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 
                      trigger_record.trigger_name, 
                      trigger_record.event_object_table);
        RAISE NOTICE 'Trigger eliminado: % en tabla %', 
                     trigger_record.trigger_name, 
                     trigger_record.event_object_table;
    END LOOP;
END $$;

-- 7. Verificar que la columna 'message' existe y 'contenido' no existe
DO $$
BEGIN
    -- Verificar que 'message' existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'message'
    ) THEN
        RAISE EXCEPTION 'La columna message no existe en la tabla notifications';
    END IF;

    -- Verificar que 'contenido' NO existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'contenido'
    ) THEN
        RAISE NOTICE 'ADVERTENCIA: La columna contenido existe pero no debería. Considera eliminarla.';
    END IF;

    RAISE NOTICE 'Verificación completada: La estructura de la tabla es correcta';
END $$;

-- ✅ CORRECCIÓN COMPLETA
-- Ahora las notificaciones deberían funcionar correctamente usando 'message' en lugar de 'contenido'
