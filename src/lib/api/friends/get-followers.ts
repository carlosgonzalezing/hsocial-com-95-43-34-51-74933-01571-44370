import { supabase } from "@/integrations/supabase/client";
import { Friend } from "./types";

export async function getFollowers() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Get friendships
    const { data: friendships, error: followersError } = await supabase
      .from('friendships')
      .select('id, user_id')
      .eq('friend_id', user.id)
      .eq('status', 'accepted');

    if (followersError) throw followersError;

    // Fetch profiles separately
    const followersArray = await Promise.all((friendships || []).map(async (friendship) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', friendship.user_id)
        .single();

      if (!profile) return null;

      return {
        friend_id: profile.id,
        friend_username: profile.username || '',
        friend_avatar_url: profile.avatar_url
      };
    }));

    return followersArray.filter(Boolean) as Friend[];
  } catch (error: any) {
    console.error('Error getting followers:', error);
    throw error;
  }
}
