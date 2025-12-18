-- PASO 2: Función optimizada para agregar reacciones con validación
CREATE OR REPLACE FUNCTION add_reaction_optimized(
  p_post_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL, 
  p_reaction_type TEXT DEFAULT 'love'
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id UUID;
  post_author_id UUID;
  comment_author_id UUID;
  existing_reaction_id UUID;
  result_count INTEGER;
BEGIN
  -- Obtener usuario actual
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuario no autenticado');
  END IF;

  -- Validar que solo se proporcione post_id O comment_id
  IF (p_post_id IS NULL AND p_comment_id IS NULL) OR (p_post_id IS NOT NULL AND p_comment_id IS NOT NULL) THEN
    RETURN json_build_object('success', false, 'error', 'Debe proporcionar post_id O comment_id, no ambos');
  END IF;

  -- Prevenir auto-reacciones en posts
  IF p_post_id IS NOT NULL THEN
    SELECT user_id INTO post_author_id FROM posts WHERE id = p_post_id;
    IF post_author_id = current_user_id THEN
      RETURN json_build_object('success', false, 'error', 'No puedes reaccionar a tus propios posts');
    END IF;
  END IF;

  -- Prevenir auto-reacciones en comentarios
  IF p_comment_id IS NOT NULL THEN
    SELECT user_id INTO comment_author_id FROM comments WHERE id = p_comment_id;
    IF comment_author_id = current_user_id THEN
      RETURN json_build_object('success', false, 'error', 'No puedes reaccionar a tus propios comentarios');
    END IF;
  END IF;

  -- Verificar si ya existe una reacción (para toggle)
  IF p_post_id IS NOT NULL THEN
    SELECT id INTO existing_reaction_id 
    FROM reactions 
    WHERE user_id = current_user_id AND post_id = p_post_id;
  ELSE
    SELECT id INTO existing_reaction_id 
    FROM reactions 
    WHERE user_id = current_user_id AND comment_id = p_comment_id;
  END IF;

  -- Si ya existe, eliminarla (toggle off)
  IF existing_reaction_id IS NOT NULL THEN
    DELETE FROM reactions WHERE id = existing_reaction_id;
    RETURN json_build_object('success', true, 'action', 'removed', 'reaction_type', NULL);
  END IF;

  -- Insertar nueva reacción
  INSERT INTO reactions (user_id, post_id, comment_id, reaction_type)
  VALUES (current_user_id, p_post_id, p_comment_id, p_reaction_type);
  
  GET DIAGNOSTICS result_count = ROW_COUNT;
  
  IF result_count > 0 THEN
    RETURN json_build_object('success', true, 'action', 'added', 'reaction_type', p_reaction_type);
  ELSE
    RETURN json_build_object('success', false, 'error', 'Error al insertar la reacción');
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;