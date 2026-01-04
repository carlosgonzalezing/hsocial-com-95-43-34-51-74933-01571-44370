-- Asegurar que existe el canal global
INSERT INTO public.canales (id, nombre, es_privado, created_at)
VALUES (
  '2f79759f-c53f-40ae-b786-59f6e69264a6',
  'Chat Global',
  false,
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Habilitar Realtime para la tabla mensajes
ALTER TABLE public.mensajes REPLICA IDENTITY FULL;

-- Agregar la tabla mensajes a la publicación de realtime (si no está ya)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'mensajes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes;
  END IF;
END $$;