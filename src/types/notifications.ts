
import type { Database } from "@/integrations/supabase/types";

export type NotificationType = 
  | 'friend_request' 
  | 'message' 
  | 'like' 
  | 'new_post' 
  | 'post_like' 
  | 'post_comment'
  | 'comment_reply'
  | 'friend_accepted'
  | 'mention'
  | 'profile_heart_received'
  | 'engagement_hearts_earned'
  | 'hearts_daily_summary'
  | 'post_share'
  | 'comment_like'
  | 'birthday'
  | 'event_invitation'
  | 'suggestion';

export interface Notification {
  id: string;
  type: NotificationType;
  sender_id: string;
  receiver_id: string;
  post_id?: string;
  comment_id?: string;
  message?: string;
  created_at: string;
  read: boolean;
  post_content?: string;
  post_media?: string | null;
  comment_content?: string;
}

export interface NotificationWithSender extends Notification {
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name?: string;
  };
}

export interface DatabaseNotification {
  id: string;
  type: string;
  sender_id: string;
  receiver_id: string;
  message?: string;
  created_at: string;
  read: boolean;
  post_id?: string;
  comment_id?: string;
}

export type DatabaseNotificationInsert = Partial<DatabaseNotification>;
export type DatabaseNotificationUpdate = Partial<DatabaseNotification>;
