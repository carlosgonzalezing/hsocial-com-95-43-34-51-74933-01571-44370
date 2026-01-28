-- Send automatic DM after publishing an idea (runs with elevated privileges)

CREATE OR REPLACE FUNCTION public.send_idea_published_dm(
  recipient_user_id uuid,
  sender_user_id uuid DEFAULT 'a12b715b-588a-41eb-bc09-5739bb579894'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_channel_id uuid;
  v_message text := 'Gracias por compartir tu idea en hsocial 🙌\n\nAquí nadie se queda solo. En un plazo de 24 a 48 horas, alguien del equipo leerá tu idea y te dará una respuesta.\n\nMientras tanto, asegúrate de que tu idea explique bien el problema, a quién va dirigida y qué buscas.';
BEGIN
  IF recipient_user_id IS NULL THEN
    RAISE EXCEPTION 'recipient_user_id is required';
  END IF;

  IF sender_user_id IS NULL THEN
    RAISE EXCEPTION 'sender_user_id is required';
  END IF;

  IF recipient_user_id = sender_user_id THEN
    RETURN NULL;
  END IF;

  -- Find an existing private channel that has exactly these two members
  SELECT c.id INTO v_channel_id
  FROM public.canales c
  JOIN public.miembros_canal mc ON mc.id_canal = c.id
  WHERE c.es_privado = true
    AND mc.id_usuario IN (sender_user_id, recipient_user_id)
  GROUP BY c.id
  HAVING COUNT(DISTINCT mc.id_usuario) = 2
     AND (SELECT COUNT(*) FROM public.miembros_canal mc2 WHERE mc2.id_canal = c.id) = 2
  LIMIT 1;

  -- If none exists, create it
  IF v_channel_id IS NULL THEN
    INSERT INTO public.canales (nombre, es_privado)
    VALUES ('Chat privado', true)
    RETURNING id INTO v_channel_id;

    INSERT INTO public.miembros_canal (id_canal, id_usuario)
    VALUES (v_channel_id, sender_user_id);

    INSERT INTO public.miembros_canal (id_canal, id_usuario)
    VALUES (v_channel_id, recipient_user_id);
  ELSE
    -- Ensure both memberships exist
    INSERT INTO public.miembros_canal (id_canal, id_usuario)
    SELECT v_channel_id, sender_user_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.miembros_canal mc0
      WHERE mc0.id_canal = v_channel_id AND mc0.id_usuario = sender_user_id
    );

    INSERT INTO public.miembros_canal (id_canal, id_usuario)
    SELECT v_channel_id, recipient_user_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.miembros_canal mc1
      WHERE mc1.id_canal = v_channel_id AND mc1.id_usuario = recipient_user_id
    );
  END IF;

  -- De-duplicate: do not send the same auto message more than once in the last 7 days
  IF EXISTS (
    SELECT 1
    FROM public.mensajes m
    WHERE m.id_canal = v_channel_id
      AND m.id_autor = sender_user_id
      AND m.contenido = v_message
      AND m.created_at > now() - interval '7 days'
    LIMIT 1
  ) THEN
    RETURN v_channel_id;
  END IF;

  INSERT INTO public.mensajes (contenido, id_canal, id_autor)
  VALUES (v_message, v_channel_id, sender_user_id);

  RETURN v_channel_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_idea_published_dm(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_idea_published_dm(uuid) TO authenticated;
