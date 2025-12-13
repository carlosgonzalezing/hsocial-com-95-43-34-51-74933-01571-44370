// 3 tipos de reacciones para H Social

export type SimpleReactionType = "love" | "awesome" | "incredible";

export interface ReactionData {
  id: string;
  reaction_type: SimpleReactionType;
  user_id: string;
  created_at: string;
  post_id?: string;
  comment_id?: string;
}

export interface ReactionTable {
  Row: {
    id: string;
    user_id: string;
    post_id: string | null;
    comment_id: string | null;
    reaction_type: SimpleReactionType;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    post_id?: string | null;
    comment_id?: string | null;
    reaction_type: SimpleReactionType;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    post_id?: string | null;
    comment_id?: string | null;
    reaction_type?: SimpleReactionType;
    created_at?: string;
  };
}
