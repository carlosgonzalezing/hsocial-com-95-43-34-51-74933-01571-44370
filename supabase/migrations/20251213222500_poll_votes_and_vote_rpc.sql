-- Poll voting support (poll_votes table + vote_on_poll RPC)

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'poll_votes'
      AND policyname = 'Users can insert their own poll votes'
  ) THEN
    CREATE POLICY "Users can insert their own poll votes"
    ON public.poll_votes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'poll_votes'
      AND policyname = 'Users can read their own poll votes'
  ) THEN
    CREATE POLICY "Users can read their own poll votes"
    ON public.poll_votes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.vote_on_poll(
  post_id_param uuid,
  option_id_param text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  poll_data jsonb;
  options_data jsonb;
  updated_options jsonb;
  total_votes_int integer;
  option_found boolean := false;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuario no autenticado');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.poll_votes
    WHERE post_id = post_id_param
      AND user_id = current_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ya votaste en esta encuesta');
  END IF;

  SELECT poll
  INTO poll_data
  FROM public.posts
  WHERE id = post_id_param
  FOR UPDATE;

  IF poll_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Encuesta no encontrada');
  END IF;

  options_data := poll_data->'options';
  IF options_data IS NULL OR jsonb_typeof(options_data) <> 'array' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Opciones inválidas');
  END IF;

  updated_options := (
    SELECT jsonb_agg(
      CASE
        WHEN (opt->>'id') = option_id_param THEN
          (jsonb_set(opt, '{votes}', to_jsonb(COALESCE((opt->>'votes')::int, 0) + 1), true))
        ELSE
          opt
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(options_data) WITH ORDINALITY AS t(opt, ord)
  );

  option_found := EXISTS (
    SELECT 1
    FROM jsonb_array_elements(options_data) AS t(opt)
    WHERE (opt->>'id') = option_id_param
  );

  IF NOT option_found THEN
    RETURN jsonb_build_object('success', false, 'error', 'Opción no encontrada');
  END IF;

  total_votes_int := COALESCE((poll_data->>'total_votes')::int, 0) + 1;

  poll_data := jsonb_set(poll_data, '{options}', COALESCE(updated_options, '[]'::jsonb), true);
  poll_data := jsonb_set(poll_data, '{total_votes}', to_jsonb(total_votes_int), true);

  UPDATE public.posts
  SET poll = poll_data
  WHERE id = post_id_param;

  INSERT INTO public.poll_votes (post_id, user_id, option_id)
  VALUES (post_id_param, current_user_id, option_id_param);

  RETURN jsonb_build_object('success', true, 'poll', poll_data);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;
