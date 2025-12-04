import { supabase } from '@/integrations/supabase/client';

export async function getFriendRequests() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status, created_at')
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching friend requests:', error);
      return [];
    }

    // Fetch profiles separately
    const friendRequests = await Promise.all((data || []).map(async (friendship) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url, status, last_seen')
        .eq('id', friendship.user_id)
        .single();

      return {
        ...friendship,
        profiles: profile
      };
    }));

    return friendRequests;
  } catch (error) {
    console.error('Error in getFriendRequests:', error);
    return [];
  }
}

export async function acceptFriendRequest(requestId: string) {
  try {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return false;
  }
}

export async function rejectFriendRequest(requestId: string) {
  try {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return false;
  }
}

export async function sendFriendRequest(friendId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: existingFriendship, error: checkError } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingFriendship) {
      return { success: false, status: existingFriendship.status, message: 'Friendship already exists' };
    }

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      });

    if (error) throw error;
    return { success: true, status: 'pending', message: 'Friend request sent' };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return { success: false, status: null, message: 'Failed to send friend request' };
  }
}

export async function getFriends() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get friendships where user is involved
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status, created_at')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (error) throw error;

    // Fetch profiles for each friend
    const friends = await Promise.all((friendships || []).map(async (friendship) => {
      const friendUserId = friendship.user_id === user.id ? friendship.friend_id : friendship.user_id;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, status, last_seen')
        .eq('id', friendUserId)
        .single();

      return {
        id: friendship.id,
        userId: friendUserId,
        username: profile?.username || '',
        avatarUrl: profile?.avatar_url || null,
        status: profile?.status || 'offline',
        last_seen: profile?.last_seen || null,
        createdAt: friendship.created_at
      };
    }));

    return friends;
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
}

export async function removeFriend(friendshipId: string) {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    return false;
  }
}
