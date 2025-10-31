
import { supabase } from "@/integrations/supabase/client";
import { FriendRequest } from "./types";

export async function getPendingFriendRequests() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Get pending friendships
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status, created_at')
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (error) {
      console.error("Error fetching pending requests:", error);
      throw error;
    }

    // Fetch profiles separately
    const requestsArray = await Promise.all((friendships || []).map(async (friendship) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', friendship.user_id)
        .single();

      return {
        id: friendship.id,
        user_id: friendship.user_id,
        friend_id: friendship.friend_id,
        status: 'pending' as const,
        created_at: friendship.created_at,
        user: {
          username: profile?.username || '',
          avatar_url: profile?.avatar_url
        },
        mutual_friends: []
      };
    }));

    return requestsArray;
  } catch (error: any) {
    console.error('Error getting friend requests:', error);
    return [];
  }
}

// Optimized helper function to get mutual friends
async function getMutualFriendsForRequests(requests: any[]) {
  try {
    if (!requests || requests.length === 0) return {};
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};
    
    // Get all user's friends in one query
    const { data: userFriends } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted');
    
    if (!userFriends || userFriends.length === 0) {
      return requests.reduce((acc, req) => ({ ...acc, [req.user_id]: [] }), {});
    }
    
    const userFriendIds = userFriends.map(f => f.friend_id);
    const requestUserIds = requests.map(req => req.user_id);
    
    // Get all request senders' friends in one query
    const { data: allRequestUserFriends } = await supabase
      .from('friendships')
      .select('user_id, friend_id')
      .in('user_id', requestUserIds)
      .eq('status', 'accepted');
    
    const mutualFriendsMap: Record<string, any[]> = {};
    
    for (const requestUserId of requestUserIds) {
      const requestUserFriends = allRequestUserFriends?.filter(f => f.user_id === requestUserId) || [];
      const requestUserFriendIds = requestUserFriends.map(f => f.friend_id);
      const mutualFriendIds = userFriendIds.filter(id => requestUserFriendIds.includes(id));
      
      if (mutualFriendIds.length === 0) {
        mutualFriendsMap[requestUserId] = [];
        continue;
      }
      
      // Get profiles for mutual friends
      const { data: mutualFriendProfiles } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .in('id', mutualFriendIds)
        .limit(3);
      
      mutualFriendsMap[requestUserId] = mutualFriendProfiles || [];
    }
    
    return mutualFriendsMap;
  } catch (error) {
    console.error('Error getting mutual friends:', error);
    return {};
  }
}
