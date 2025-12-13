
export interface ProfileTable {
  Row: {
    id: string;
    username: string | null;
    bio: string | null;
    avatar_url: string | null;
    cover_url: string | null;
    career: string | null;
    semester: string | null;
    birth_date: string | null;
    gender: string | null;
    relationship_status: string | null;
    institution_name: string | null;
    academic_role: string | null;
    created_at: string;
    updated_at: string;
    // Nuevos campos que podrían ser útiles
    last_seen: string | null;
    status: 'online' | 'offline' | 'away' | null;
  };
  Insert: {
    id: string;
    username?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    cover_url?: string | null;
    career?: string | null;
    semester?: string | null;
    birth_date?: string | null;
    gender?: string | null;
    relationship_status?: string | null;
    institution_name?: string | null;
    academic_role?: string | null;
    created_at?: string;
    updated_at?: string;
    last_seen?: string | null;
    status?: 'online' | 'offline' | 'away' | null;
  };
  Update: {
    id?: string;
    username?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    cover_url?: string | null;
    career?: string | null;
    semester?: string | null;
    birth_date?: string | null;
    gender?: string | null;
    relationship_status?: string | null;
    institution_name?: string | null;
    academic_role?: string | null;
    created_at?: string;
    updated_at?: string;
    last_seen?: string | null;
    status?: 'online' | 'offline' | 'away' | null;
  };
}

/**
 * SQL para crear la tabla profiles con ON DELETE CASCADE en todas las tablas relacionadas:
 * 
 * -- Ejemplo para la tabla posts:
 * ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
 * ALTER TABLE posts ADD CONSTRAINT posts_user_id_fkey 
 *   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
 * 
 * -- Ejemplo para la tabla comments:
 * ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
 * ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
 *   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
 * 
 * -- Hacer lo mismo para todas las tablas que referencian profiles.id:
 * -- reactions, friendships, messages, notifications, etc.
 */

/**
 * Para ejecutar una limpieza desde el Editor SQL de Supabase:
 * 
 * -- Conservar solo un usuario específico (reemplaza 'ID_DEL_USUARIO_A_CONSERVAR')
 * DELETE FROM profiles WHERE id != 'ID_DEL_USUARIO_A_CONSERVAR';
 * 
 * -- O para eliminar usuarios específicos (reemplaza 'ID_USUARIO_1', 'ID_USUARIO_2'):
 * DELETE FROM profiles WHERE id IN ('ID_USUARIO_1', 'ID_USUARIO_2');
 * 
 * Con las restricciones CASCADE correctamente configuradas, 
 * esto eliminará automáticamente todos los datos relacionados.
 */
