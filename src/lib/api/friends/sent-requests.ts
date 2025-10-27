
import { supabase } from "@/integrations/supabase/client";
import { FriendRequest } from "./types";

export async function getSentFriendRequests() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Obtenemos solicitudes pendientes enviadas por el usuario actual
    const { data: sentRequests, error } = await supabase
      .from('friendships')
      .select(`
        id,
        friend:profiles!friendships_friend_id_fkey (
          id,
          username,
          avatar_url
        ),
        created_at
      `)
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (error) {
      console.error("Error fetching sent requests:", error);
      throw error;
    }

    // Convertimos el resultado al formato FriendRequest
    const requestsArray = (sentRequests || []).map(request => ({
      id: request.id,
      user_id: user.id,
      friend_id: request.friend.id,
      status: 'pending' as const,
      created_at: request.created_at,
      user: {
        username: request.friend.username || '',
        avatar_url: request.friend.avatar_url
      }
    }));

    return requestsArray;
  } catch (error: any) {
    console.error('Error getting sent friend requests:', error);
    return [];
  }
}
