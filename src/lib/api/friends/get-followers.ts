
import { supabase } from "@/integrations/supabase/client";
import { Friend } from "./types";

export async function getFollowers() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Obtenemos usuarios que siguen al usuario actual
    const { data: followers, error: followersError } = await supabase
      .from('friendships')
      .select(`
        user:profiles!friendships_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'accepted');

    if (followersError) throw followersError;

    // Convertimos el resultado a nuestro formato Friend
    const followersArray = (followers || []).map(f => ({
      friend_id: f.user.id,
      friend_username: f.user.username || '',
      friend_avatar_url: f.user.avatar_url
    }));

    return followersArray;
  } catch (error: any) {
    console.error('Error getting followers:', error);
    throw error;
  }
}
