
import { supabase } from "@/integrations/supabase/client";

export async function sendMentionNotifications(
  content: string,
  postId: string,
  commentId?: string,
  currentUserId?: string
) {
  try {
    // If there's no content or current user, exit early
    if (!content || !currentUserId) return;

    // Extract mentions using regex (usernames starting with @)
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    
    if (!matches || matches.length === 0) return;
    
    // Extract usernames without the @ symbol
    const mentionedUsernames = matches.map(match => match.substring(1));
    
    // Find user IDs from usernames
    const { data: userProfiles, error } = await supabase
      .from("profiles")
      .select("id, username")
      .in("username", mentionedUsernames);
    
    if (error || !userProfiles || userProfiles.length === 0) return;
    
    // Don't notify the current user if they mention themselves
    const notificationTargets = userProfiles.filter(
      profile => profile.id !== currentUserId
    );
    
    if (notificationTargets.length === 0) return;
    
    // Create notification for each mentioned user
    const notifications = notificationTargets.map(profile => ({
      type: commentId ? "comment_mention" : "post_mention",
      sender_id: currentUserId,
      receiver_id: profile.id,
      post_id: postId,
      comment_id: commentId,
      read: false,
      message: `Te ha mencionado en ${commentId ? "un comentario" : "una publicación"}`
    }));
    
    // Insert notifications
    await supabase
      .from("notifications")
      .insert(notifications);
      
    return true;
  } catch (error) {
    console.error("Error sending mention notifications:", error);
    return false;
  }
}
