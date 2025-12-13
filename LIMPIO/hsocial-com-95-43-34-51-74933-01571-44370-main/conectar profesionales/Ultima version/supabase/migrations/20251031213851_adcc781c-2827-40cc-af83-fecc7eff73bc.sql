-- Agregar columnas para estilos de contenido y archivos
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS background_color TEXT,
ADD COLUMN IF NOT EXISTS content_style JSONB;

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_posts_background_color ON posts(background_color);