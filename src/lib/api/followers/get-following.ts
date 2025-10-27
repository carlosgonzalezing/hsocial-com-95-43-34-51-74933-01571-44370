import { supabase } from "@/integrations/supabase/client";

export interface Following {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export async function getFollowing(userId?: string): Promise<Following[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase
      .from('followers')
      .select(`
        created_at,
        profiles!followers_following_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('follower_id', targetUserId);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.profiles.id,
      username: item.profiles.username || 'Usuario',
      avatar_url: item.profiles.avatar_url,
      created_at: item.created_at
    }));
  } catch (error: any) {
    console.error('Error getting following:', error);
    return [];
  }
}