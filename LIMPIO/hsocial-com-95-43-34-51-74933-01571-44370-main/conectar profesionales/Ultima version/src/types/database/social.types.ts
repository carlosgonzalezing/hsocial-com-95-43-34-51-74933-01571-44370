export type ReactionType = "love" | "awesome" | "incredible";

export interface ReactionData {
  id: string;
  reaction_type: ReactionType;
  user_id: string;
  created_at: string;
  post_id?: string;
  comment_id?: string;
}

// Add the missing types that are referenced in database/index.ts
export interface Notification {
  id: string;
  type: string;
  user_id: string;
  created_at: string;
  read: boolean;
  content?: string;
  sender_id?: string;
  receiver_id?: string;
  post_id?: string;
  comment_id?: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at?: string;
}
