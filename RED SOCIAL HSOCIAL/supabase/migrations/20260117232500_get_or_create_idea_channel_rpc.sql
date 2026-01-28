ALTER TABLE public.idea_channels ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_or_create_idea_channel(p_post_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_owner uuid;
  v_title text;
  v_channel uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT p.user_id, COALESCE(p.idea->>'title', 'Chat de idea')
  INTO v_owner, v_title
  FROM public.posts p
  WHERE p.id = p_post_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'idea_not_found';
  END IF;

  SELECT ic.channel_id
  INTO v_channel
  FROM public.idea_channels ic
  WHERE ic.post_id = p_post_id;

  IF v_channel IS NOT NULL THEN
    IF auth.uid() = v_owner
      OR EXISTS (
        SELECT 1
        FROM public.idea_participants ip
        WHERE ip.post_id = p_post_id
          AND ip.user_id = auth.uid()
      )
    THEN
      RETURN v_channel;
    END IF;

    RAISE EXCEPTION 'not_authorized';
  END IF;

  IF auth.uid() <> v_owner THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.canales (nombre, es_privado)
  VALUES ('Idea: ' || v_title, true)
  RETURNING id INTO v_channel;

  INSERT INTO public.idea_channels (post_id, channel_id)
  VALUES (p_post_id, v_channel);

  INSERT INTO public.miembros_canal (id_canal, id_usuario)
  SELECT v_channel, v_owner
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.miembros_canal mc
    WHERE mc.id_canal = v_channel
      AND mc.id_usuario = v_owner
  );

  INSERT INTO public.miembros_canal (id_canal, id_usuario)
  SELECT v_channel, ip.user_id
  FROM public.idea_participants ip
  WHERE ip.post_id = p_post_id
    AND ip.user_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.miembros_canal mc
      WHERE mc.id_canal = v_channel
        AND mc.id_usuario = ip.user_id
    );

  RETURN v_channel;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_idea_channel(uuid) TO authenticated;
