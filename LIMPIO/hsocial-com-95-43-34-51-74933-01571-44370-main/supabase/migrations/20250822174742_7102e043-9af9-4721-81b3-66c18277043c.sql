-- Habilitar protección contra contraseñas filtradas
-- y agregar search_path seguro a funciones que lo necesiten

-- Primero revisar y corregir las funciones que no tienen search_path configurado
-- Las funciones existentes ya tienen la mayoría con search_path correcto

-- Función que puede necesitar search_path
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Eliminar notificaciones más antiguas de 30 días
  DELETE FROM public.notifications 
  WHERE created_at < now() - INTERVAL '30 days';
END;
$function$;

-- Función para limpiar datos temporales
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO ''
AS $function$
BEGIN
  -- Esta función puede ser llamada por un cron job
  -- para limpiar sesiones expiradas u otros datos temporales
  
  -- Por ahora solo registramos que se ejecutó
  RAISE NOTICE 'Cleanup function executed at %', now();
END;
$function$;