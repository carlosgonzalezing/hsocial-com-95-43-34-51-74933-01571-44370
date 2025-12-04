export type ReactionType = 'love' | 'awesome' | 'incredible';

export interface LikeTable {
  Row: {
    id: string;
    user_id: string;
    post_id: string | null;
    comment_id: string | null;
    reaction_type: ReactionType;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    post_id?: string | null;
    comment_id?: string | null;
    reaction_type: ReactionType;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    post_id?: string | null;
    comment_id?: string | null;
    reaction_type?: ReactionType;
    created_at?: string;
  };
}

export interface FriendshipTable {
  Row: {
    id: string;
    user_id: string;
    friend_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    friend_id: string;
    status?: 'pending' | 'accepted' | 'rejected';
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    friend_id?: string;
    status?: 'pending' | 'accepted' | 'rejected';
    created_at?: string;
  };
}
