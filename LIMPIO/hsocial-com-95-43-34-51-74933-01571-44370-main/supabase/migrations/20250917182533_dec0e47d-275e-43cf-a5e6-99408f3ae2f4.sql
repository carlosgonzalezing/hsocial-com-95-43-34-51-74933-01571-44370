-- Crear índices para optimizar consultas de popularidad
CREATE INDEX IF NOT EXISTS idx_friendships_friend_status ON public.friendships(friend_id, status) WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS idx_profile_hearts_profile_id ON public.profile_hearts(profile_id);
CREATE INDEX IF NOT EXISTS idx_engagement_hearts_user_id ON public.engagement_hearts(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_career ON public.profiles(career) WHERE career IS NOT NULL;

-- Función optimizada para obtener usuarios populares
CREATE OR REPLACE FUNCTION public.get_popular_users(limit_count integer DEFAULT 100)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  career text,
  semester text,
  followers_count bigint,
  hearts_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    COALESCE(p.username, 'Usuario') as username,
    p.avatar_url,
    p.career,
    p.semester,
    COALESCE(f.followers_count, 0) as followers_count,
    COALESCE(ph.profile_hearts_count, 0) + COALESCE(eh.engagement_hearts_count, 0) as hearts_count
  FROM public.profiles p
  LEFT JOIN (
    SELECT 
      friend_id,
      COUNT(*) as followers_count
    FROM public.friendships 
    WHERE status = 'accepted'
    GROUP BY friend_id
  ) f ON p.id = f.friend_id
  LEFT JOIN (
    SELECT 
      profile_id,
      COUNT(*) as profile_hearts_count
    FROM public.profile_hearts
    GROUP BY profile_id
  ) ph ON p.id = ph.profile_id
  LEFT JOIN (
    SELECT 
      user_id,
      SUM(hearts_received) as engagement_hearts_count
    FROM public.engagement_hearts
    GROUP BY user_id
  ) eh ON p.id = eh.user_id
  WHERE p.username IS NOT NULL
  ORDER BY hearts_count DESC, followers_count DESC
  LIMIT limit_count;
$$;

-- Función para obtener filtros de carrera únicos
CREATE OR REPLACE FUNCTION public.get_career_filters()
RETURNS TABLE(career text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.career
  FROM public.profiles p
  WHERE p.career IS NOT NULL 
    AND p.career != ''
    AND p.username IS NOT NULL
  ORDER BY p.career;
$$;