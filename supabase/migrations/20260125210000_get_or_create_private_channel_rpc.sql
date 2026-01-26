-- Create/get private DM channel via RPC to avoid client-side RLS failures

-- Ensure canales has RLS enabled and authenticated has table privileges
ALTER TABLE public.canales ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.canales TO authenticated;

-- Ensure there is an insert policy for authenticated users
DROP POLICY IF EXISTS "Users can create channels" ON public.canales;
CREATE POLICY "Users can create channels"
ON public.canales
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Create DM channel RPC
CREATE OR REPLACE FUNCTION public.get_or_create_private_channel(p_user1 uuid, p_user2 uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_channel_id uuid;
  v_member_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Caller must be one of the users (and we expect caller to be p_user1 from the client)
  IF auth.uid() <> p_user1 THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_user1 IS NULL OR p_user2 IS NULL THEN
    RAISE EXCEPTION 'Missing users';
  END IF;

  IF p_user1 = p_user2 THEN
    RAISE EXCEPTION 'Users must be different';
  END IF;

  -- Find existing private channel where both users are members
  SELECT c.id
    INTO v_channel_id
  FROM public.canales c
  WHERE c.es_privado = true
    AND EXISTS (
      SELECT 1 FROM public.miembros_canal m1
      WHERE m1.id_canal = c.id AND m1.id_usuario = p_user1
    )
    AND EXISTS (
      SELECT 1 FROM public.miembros_canal m2
      WHERE m2.id_canal = c.id AND m2.id_usuario = p_user2
    )
  ORDER BY c.created_at DESC
  LIMIT 1;

  IF v_channel_id IS NOT NULL THEN
    SELECT count(*) INTO v_member_count
    FROM public.miembros_canal mc
    WHERE mc.id_canal = v_channel_id;

    -- Ensure it's a 1:1 channel
    IF v_member_count = 2 THEN
      RETURN v_channel_id;
    END IF;
  END IF;

  -- Create new channel
  INSERT INTO public.canales (nombre, es_privado)
  VALUES ('Chat privado', true)
  RETURNING id INTO v_channel_id;

  -- Add both members (sequential, and idempotent if unique constraint exists)
  INSERT INTO public.miembros_canal (id_canal, id_usuario)
  VALUES (v_channel_id, p_user1)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.miembros_canal (id_canal, id_usuario)
  VALUES (v_channel_id, p_user2)
  ON CONFLICT DO NOTHING;

  RETURN v_channel_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_private_channel(uuid, uuid) TO authenticated;
