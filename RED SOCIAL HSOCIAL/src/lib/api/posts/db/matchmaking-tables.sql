
-- Tabla para acciones de match (likes, passes, super likes)
CREATE TABLE IF NOT EXISTS match_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('like', 'pass', 'super_like')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_user_id)
);

-- Tabla para dúos dinámicos (matches)
CREATE TABLE IF NOT EXISTS duo_dinamico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  duo_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Índices para optimizar las consultas
CREATE INDEX IF NOT EXISTS idx_match_actions_user_id ON match_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_actions_target_user_id ON match_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_match_actions_created_at ON match_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_duo_dinamico_users ON duo_dinamico(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_duo_dinamico_active ON duo_dinamico(is_active);

-- RLS (Row Level Security) políticas
ALTER TABLE match_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE duo_dinamico ENABLE ROW LEVEL SECURITY;

-- Política para match_actions: usuarios pueden ver sus propias acciones
CREATE POLICY "Users can view their own match actions" ON match_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own match actions" ON match_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para duo_dinamico: usuarios pueden ver dúos donde participan
CREATE POLICY "Users can view their duos" ON duo_dinamico
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert duos" ON duo_dinamico
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their duos" ON duo_dinamico
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Función para obtener recomendaciones de perfiles
CREATE OR REPLACE FUNCTION get_profile_recommendations(current_user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  career TEXT,
  semester TEXT,
  bio TEXT,
  compatibility_score INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.career,
    p.semester,
    p.bio,
    -- Calcular puntuación de compatibilidad simple
    CASE 
      WHEN p.career = (SELECT career FROM profiles WHERE id = current_user_id) THEN 80
      ELSE 50
    END + (RANDOM() * 20)::INTEGER as compatibility_score
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.id NOT IN (
      SELECT target_user_id FROM match_actions WHERE user_id = current_user_id
    )
    AND p.id NOT IN (
      SELECT CASE 
        WHEN f.user_id = current_user_id THEN f.friend_id
        ELSE f.user_id 
      END
      FROM friendships f 
      WHERE (f.user_id = current_user_id OR f.friend_id = current_user_id)
        AND f.status = 'accepted'
    )
  ORDER BY compatibility_score DESC
  LIMIT limit_count;
END;
$$;
