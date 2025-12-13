-- Agregar columna media_urls a la tabla posts si no existe
-- Esta columna almacena múltiples URLs de imágenes/videos en un array

ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS media_urls TEXT[];

-- Comentario para documentar la columna
COMMENT ON COLUMN public.posts.media_urls IS 'Array de URLs de medios (imágenes/videos) para publicaciones con múltiples archivos';
