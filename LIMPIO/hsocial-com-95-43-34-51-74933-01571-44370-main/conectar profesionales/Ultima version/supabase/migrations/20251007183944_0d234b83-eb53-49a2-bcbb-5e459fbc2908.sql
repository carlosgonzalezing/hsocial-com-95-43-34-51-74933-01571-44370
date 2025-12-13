-- Verificar y agregar columna shared_post_id si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'posts'
    AND column_name = 'shared_post_id'
  ) THEN
    -- Agregar columna para rastrear posts compartidos
    ALTER TABLE public.posts 
    ADD COLUMN shared_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL;
    
    -- Crear índice para mejorar rendimiento en consultas de posts compartidos
    CREATE INDEX idx_posts_shared_post_id ON public.posts(shared_post_id) 
    WHERE shared_post_id IS NOT NULL;
    
    RAISE NOTICE 'Columna shared_post_id agregada exitosamente';
  ELSE
    RAISE NOTICE 'Columna shared_post_id ya existe';
  END IF;
END
$$;

-- Comentario para documentación
COMMENT ON COLUMN public.posts.shared_post_id IS 
'ID del post original cuando este post es un compartir de otro post';