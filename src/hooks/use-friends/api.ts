import { supabase } from '@/integrations/supabase/client';

export async function getFriendRequests() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        created_at,
        profiles!friendships_friend_id_fkey (
          username,
          avatar_url,
          status,
          last_seen
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching friend requests:', error);
      return [];
    }

    return data || [];
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

    // Check if a friendship already exists
    const { data: existingFriendship, error: checkError } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`)
      .maybeSingle();

    if (checkError) throw checkError;

    // If friendship exists, return its status
    if (existingFriendship) {
      return { success: false, status: existingFriendship.status, message: 'Friendship already exists' };
    }

    // Create new friendship request
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

    // Get friends where user is the requester
    const { data: sentFriendships, error: sentError } = await supabase
      .from('friendships')
      .select(`
        id,
        friend_id,
        status,
        created_at,
        profiles!friendships_friend_id_fkey (
          id,
          username,
          avatar_url,
          status,
          last_seen
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (sentError) throw sentError;

    // Get friends where user is the recipient
    const { data: receivedFriendships, error: receivedError } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id,
        status,
        created_at,
        profiles!friendships_user_id_fkey (
          id,
          username,
          avatar_url,
          status,
          last_seen
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'accepted');

    if (receivedError) throw receivedError;

    // Combine and format the results
    const sentFriends = sentFriendships.map(friendship => ({
      id: friendship.id,
      userId: friendship.friend_id,
      username: friendship.profiles.username,
      avatarUrl: friendship.profiles.avatar_url,
      status: friendship.profiles.status,
      last_seen: friendship.profiles.last_seen,
      createdAt: friendship.created_at
    }));

    const receivedFriends = receivedFriendships.map(friendship => ({
      id: friendship.id,
      userId: friendship.user_id,
      username: friendship.profiles.username,
      avatarUrl: friendship.profiles.avatar_url,
      status: friendship.profiles.status,
      last_seen: friendship.profiles.last_seen,
      createdAt: friendship.created_at
    }));

    return [...sentFriends, ...receivedFriends];
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
