-- PASO 1: Eliminar constraint existente primero
ALTER TABLE reactions 
DROP CONSTRAINT IF EXISTS reactions_reaction_type_check;

-- PASO 2: Migrar reacciones existentes a los nuevos tipos
-- Mapeo: like→awesome, love→love, wow→interesting, haha→success, angry→join
UPDATE reactions 
SET reaction_type = CASE 
  WHEN reaction_type = 'like' THEN 'awesome'
  WHEN reaction_type = 'love' THEN 'love'
  WHEN reaction_type = 'wow' THEN 'interesting'
  WHEN reaction_type = 'haha' THEN 'success'
  WHEN reaction_type = 'angry' THEN 'join'
  ELSE 'love' -- fallback por defecto
END
WHERE reaction_type IN ('like', 'wow', 'haha', 'angry');

-- PASO 3: Agregar constraint nueva con los 5 tipos
ALTER TABLE reactions 
ADD CONSTRAINT reactions_reaction_type_check 
CHECK (reaction_type IN ('awesome', 'love', 'interesting', 'success', 'join'));

-- PASO 4: Actualizar comentario de la tabla
COMMENT ON COLUMN reactions.reaction_type IS 'Tipo de reacción: awesome (Genial ⭐), love (Me encanta ❤️), interesting (Interesante 💡), success (Éxito 🎓), join (Me uno 🤝)';