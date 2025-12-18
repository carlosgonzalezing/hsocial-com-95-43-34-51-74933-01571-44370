import { supabase } from "@/integrations/supabase/client";

/**
 * Extract mentions from text content
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]); // Get username without @
  }
  
  return mentions;
}

/**
 * Send mention notifications to mentioned users
 */
export async function sendMentionNotifications(
  content: string,
  senderId: string,
  context: 'message' | 'comment' | 'post',
  contextId?: string
) {
  try {
    const mentions = extractMentions(content);
    if (mentions.length === 0) return;

    // Get user IDs from usernames
    const { data: mentionedUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', mentions);

    if (usersError) {
      console.error('Error fetching mentioned users:', usersError);
      return;
    }

    if (!mentionedUsers || mentionedUsers.length === 0) return;

    // Create notifications for each mentioned user
    const notifications = mentionedUsers.map(user => ({
      type: 'mention',
      sender_id: senderId,
      receiver_id: user.id,
      message: `te mencionó en ${context === 'message' ? 'un mensaje' : context === 'comment' ? 'un comentario' : 'una publicación'}`,
      read: false,
      metadata: {
        context,
        context_id: contextId,
        mentioned_in: content.substring(0, 100) + (content.length > 100 ? '...' : '')
      }
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      console.error('Error creating mention notifications:', insertError);
    } else {
      console.log(`Created ${notifications.length} mention notifications`);
    }

  } catch (error) {
    console.error('Error in sendMentionNotifications:', error);
  }
}

/**
 * Handle mention notifications when sending messages
 */
export async function handleMessageMentions(
  messageContent: string,
  senderId: string,
  receiverId: string
) {
  await sendMentionNotifications(
    messageContent,
    senderId,
    'message',
    receiverId
  );
}