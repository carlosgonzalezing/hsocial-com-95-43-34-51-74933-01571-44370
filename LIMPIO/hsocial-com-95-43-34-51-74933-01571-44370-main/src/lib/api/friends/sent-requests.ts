
import { supabase } from "@/integrations/supabase/client";
import { FriendRequest } from "./types";

export async function getSentFriendRequests() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Get sent friendships
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('id, friend_id, created_at')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (error) {
      console.error("Error fetching sent requests:", error);
      throw error;
    }

    // Fetch profiles separately
    const requestsArray = await Promise.all((friendships || []).map(async (friendship) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', friendship.friend_id)
        .single();

      return {
        id: friendship.id,
        user_id: user.id,
        friend_id: friendship.friend_id,
        status: 'pending' as const,
        created_at: friendship.created_at,
        user: {
          username: profile?.username || '',
          avatar_url: profile?.avatar_url
        }
      };
    }));

    return requestsArray;
  } catch (error: any) {
    console.error('Error getting sent friend requests:', error);
    return [];
  }
}
