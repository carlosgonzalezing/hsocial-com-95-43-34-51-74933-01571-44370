
import { supabase } from "@/integrations/supabase/client";

export async function handleFriendRequest(notificationId: string, senderId: string, accept: boolean) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    if (accept) {
      // Actualizamos la solicitud a 'accepted'
      await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('user_id', senderId)
        .eq('friend_id', user.id);

      // Creamos la relación bidireccional
      await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: senderId,
          status: 'accepted'
        });

      // Enviamos notificación al remitente
      await supabase
        .from('notifications')
        .insert({
          type: 'friend_accepted',
          sender_id: user.id,
          receiver_id: senderId,
          read: false
        });
    } else {
      // Rechazamos la solicitud eliminándola
      await supabase
        .from('friendships')
        .delete()
        .eq('user_id', senderId)
        .eq('friend_id', user.id);
    }

    // Marcamos la notificación como leída
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    return true;
  } catch (error) {
    console.error('Error handling friend request:', error);
    return false;
  }
}

export async function markNotificationsAsRead(notificationIds?: string[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    let query = supabase
      .from('notifications')
      .update({ read: true });

    if (notificationIds && notificationIds.length > 0) {
      // Mark only the specified notifications
      query = query.in('id', notificationIds);
    } else {
      // Mark all notifications of the user
      query = query.eq('receiver_id', user.id);
    }

    await query;
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }
}

export async function removeNotification(notificationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('receiver_id', user.id);
    
    return true;
  } catch (error) {
    console.error('Error removing notification:', error);
    return false;
  }
}

export async function clearAllNotifications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    await supabase
      .from('notifications')
      .delete()
      .eq('receiver_id', user.id);
    
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
}
