
import { supabase } from "@/integrations/supabase/client";
import { Friend } from "./types";

export async function getFriends() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Obtenemos usuarios que el usuario actual ha aceptado como amigos
    const { data: acceptedFriends, error: followingError } = await supabase
      .from('friendships')
      .select(`
        friend:profiles!friendships_friend_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (followingError) throw followingError;

    // Convertimos el resultado a nuestro formato Friend
    const friendsArray = (acceptedFriends || []).map(f => ({
      friend_id: f.friend.id,
      friend_username: f.friend.username || '',
      friend_avatar_url: f.friend.avatar_url
    }));

    return friendsArray;
  } catch (error: any) {
    console.error('Error getting friends:', error);
    throw error;
  }
}
