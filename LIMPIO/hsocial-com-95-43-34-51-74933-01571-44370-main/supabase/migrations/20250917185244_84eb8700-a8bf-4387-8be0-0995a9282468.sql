-- Función optimizada para obtener posts guardados
CREATE OR REPLACE FUNCTION public.get_saved_posts(user_id_param UUID, limit_count INTEGER DEFAULT 20, offset_count INTEGER DEFAULT 0)
RETURNS TABLE(
  id UUID,
  content TEXT,
  media_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  visibility post_visibility,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  likes_count BIGINT,
  comments_count BIGINT,
  is_liked BOOLEAN,
  saved_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.media_urls,
    p.created_at,
    p.updated_at,
    p.visibility,
    p.user_id,
    pr.username,
    pr.avatar_url,
    COALESCE(l.likes_count, 0) as likes_count,
    COALESCE(c.comments_count, 0) as comments_count,
    EXISTS(
      SELECT 1 FROM public.likes 
      WHERE post_id = p.id AND user_id = user_id_param
    ) as is_liked,
    sp.created_at as saved_at
  FROM public.saved_posts sp
  JOIN public.posts p ON sp.post_id = p.id
  JOIN public.profiles pr ON p.user_id = pr.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as likes_count
    FROM public.likes
    GROUP BY post_id
  ) l ON p.id = l.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as comments_count
    FROM public.comments
    GROUP BY post_id
  ) c ON p.id = c.post_id
  WHERE sp.user_id = user_id_param
    AND p.visibility = 'public'
  ORDER BY sp.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- Función optimizada para solicitudes de amistad
CREATE OR REPLACE FUNCTION public.get_friend_requests_data(user_id_param UUID)
RETURNS TABLE(
  pending_requests JSONB,
  sent_requests JSONB,
  friends JSONB,
  suggestions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pending_data JSONB;
  sent_data JSONB;
  friends_data JSONB;
  suggestions_data JSONB;
BEGIN
  -- Solicitudes pendientes recibidas
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', f.id,
      'status', f.status,
      'created_at', f.created_at,
      'sender', jsonb_build_object(
        'id', p.id,
        'username', p.username,
        'avatar_url', p.avatar_url
      )
    )
  ), '[]'::jsonb) INTO pending_data
  FROM public.friendships f
  JOIN public.profiles p ON f.user_id = p.id
  WHERE f.friend_id = user_id_param AND f.status = 'pending';

  -- Solicitudes enviadas
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', f.id,
      'status', f.status,
      'created_at', f.created_at,
      'friend', jsonb_build_object(
        'id', p.id,
        'username', p.username,
        'avatar_url', p.avatar_url
      )
    )
  ), '[]'::jsonb) INTO sent_data
  FROM public.friendships f
  JOIN public.profiles p ON f.friend_id = p.id
  WHERE f.user_id = user_id_param AND f.status = 'pending';

  -- Amigos aceptados
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'friendship_id', f.id,
      'created_at', f.created_at
    )
  ), '[]'::jsonb) INTO friends_data
  FROM public.friendships f
  JOIN public.profiles p ON f.friend_id = p.id
  WHERE f.user_id = user_id_param AND f.status = 'accepted';

  -- Sugerencias (usuarios que no son amigos)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'career', p.career,
      'semester', p.semester
    )
  ), '[]'::jsonb) INTO suggestions_data
  FROM public.profiles p
  WHERE p.id != user_id_param
    AND p.id NOT IN (
      SELECT f.friend_id FROM public.friendships f 
      WHERE f.user_id = user_id_param
      UNION
      SELECT f.user_id FROM public.friendships f 
      WHERE f.friend_id = user_id_param
    )
    AND p.username IS NOT NULL
  ORDER BY RANDOM()
  LIMIT 20;

  RETURN QUERY SELECT pending_data, sent_data, friends_data, suggestions_data;
END;
$$;

-- Función para crear grupos con transacción atómica
CREATE OR REPLACE FUNCTION public.create_group_atomic(
  group_name TEXT,
  group_description TEXT,
  group_slug TEXT,
  is_private BOOLEAN,
  category TEXT,
  tags TEXT[],
  rules TEXT,
  creator_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_group_id UUID;
  result JSONB;
BEGIN
  -- Verificar que el slug no exista
  IF EXISTS(SELECT 1 FROM public.groups WHERE slug = group_slug) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'El nombre del grupo ya está en uso'
    );
  END IF;
  
  -- Crear el grupo
  INSERT INTO public.groups (
    name, description, slug, is_private, category, tags, rules, created_by
  ) VALUES (
    group_name, group_description, group_slug, is_private, category, tags, rules, creator_id
  ) RETURNING id INTO new_group_id;
  
  -- Agregar al creador como admin del grupo
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (new_group_id, creator_id, 'admin');
  
  -- Actualizar contador de miembros
  UPDATE public.groups 
  SET member_count = 1 
  WHERE id = new_group_id;
  
  -- Retornar resultado exitoso
  SELECT jsonb_build_object(
    'success', true,
    'group_id', new_group_id,
    'message', 'Grupo creado exitosamente'
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Función para crear eventos académicos con transacción atómica
CREATE OR REPLACE FUNCTION public.create_academic_event_atomic(
  post_content TEXT,
  post_visibility post_visibility,
  event_title TEXT,
  event_description TEXT,
  event_type TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_virtual BOOLEAN,
  meeting_link TEXT,
  max_attendees INTEGER,
  user_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_post_id UUID;
  new_event_id UUID;
  result JSONB;
BEGIN
  -- Crear el post primero
  INSERT INTO public.posts (content, visibility, user_id, post_type)
  VALUES (post_content, post_visibility, user_id_param, 'academic_event')
  RETURNING id INTO new_post_id;
  
  -- Crear el evento académico
  INSERT INTO public.academic_events (
    post_id, title, description, event_type, start_date, end_date,
    location, is_virtual, meeting_link, max_attendees
  ) VALUES (
    new_post_id, event_title, event_description, event_type, start_date, end_date,
    location, is_virtual, meeting_link, max_attendees
  ) RETURNING id INTO new_event_id;
  
  -- Retornar resultado exitoso
  SELECT jsonb_build_object(
    'success', true,
    'post_id', new_post_id,
    'event_id', new_event_id,
    'message', 'Evento creado exitosamente'
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;