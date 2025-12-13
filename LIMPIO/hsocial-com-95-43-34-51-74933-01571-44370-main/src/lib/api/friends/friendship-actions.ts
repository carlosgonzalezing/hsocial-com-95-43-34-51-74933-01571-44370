
import { supabase } from "@/integrations/supabase/client";

export async function acceptFriendRequest(requestId: string, senderId: string) {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Update friendships record to accepted
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .eq('friend_id', user.id); // Ensure the current user is the recipient

    if (error) {
      console.error("Error accepting request:", error);
      throw error;
    }

    // Create or update the bidirectional relationship
    const { error: friendshipError } = await supabase
      .from('friendships')
      .upsert({
        user_id: user.id,
        friend_id: senderId,
        status: 'accepted'
      }, { 
        onConflict: 'user_id,friend_id',
        ignoreDuplicates: false 
      });

    if (friendshipError) {
      console.error("Error creating reverse friendship:", friendshipError);
    }

    // Create notification for accepted request
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        type: 'friend_accepted',
        sender_id: user.id,
        receiver_id: senderId,
        message: 'Ha aceptado tu solicitud de amistad'
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return false;
  }
}

export async function rejectFriendRequest(requestId: string) {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .eq('friend_id', user.id); // Ensure the current user is the recipient

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return false;
  }
}

export async function cancelFriendRequest(requestId: string) {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId)
      .eq('user_id', user.id); // Ensure the current user is the sender

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error canceling friend request:', error);
    return false;
  }
}

export async function sendFriendRequest(friendId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Check if a friendship already exists in any direction
    const { data: existingFriendship, error: checkError } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`user_id.eq.${user.id}.and.friend_id.eq.${friendId},user_id.eq.${friendId}.and.friend_id.eq.${user.id}`)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingFriendship) {
      return {
        success: false,
        status: existingFriendship.status,
        message: 'Ya existe una relación con este usuario'
      };
    }

    // Create new friendship request
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) throw error;

    // Create notification for friend request
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        type: 'friend_request',
        sender_id: user.id,
        receiver_id: friendId,
        message: 'Te ha enviado una solicitud de amistad'
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    return {
      success: true,
      status: 'pending',
      message: 'Solicitud enviada correctamente',
      requestId: data?.id
    };
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    return {
      success: false,
      status: null,
      message: 'Error al enviar la solicitud'
    };
  }
}

export async function unfollowUser(friendId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Delete any friendship between these users
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`user_id.eq.${user.id}.and.friend_id.eq.${friendId},user_id.eq.${friendId}.and.friend_id.eq.${user.id}`);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
}
