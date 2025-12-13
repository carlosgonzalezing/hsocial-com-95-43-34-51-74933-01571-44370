
export interface PostTable {
  Row: {
    id: string;
    content: string;
    user_id: string;
    media_url: string | null;
    media_type: 'image' | 'video' | 'audio' | null;
    visibility: 'public' | 'friends' | 'incognito';
    poll: {
      question: string;
      options: Array<{
        id: string;
        content: string;
        votes: number;
      }>;
      total_votes: number;
      user_vote: string | null;
    } | null;
    idea: {
      title: string;
      description: string;
      participants: Array<{
        user_id: string;
        profession: string;
        joined_at: string;
        username?: string;
        avatar_url?: string;
      }>;
    } | null;
    created_at: string;
    updated_at: string;
    shared_from: string | null;
    shared_post_id: string | null;
    shared_post_author: string | null;
  };
  Insert: {
    id?: string;
    content: string;
    user_id: string;
    media_url?: string | null;
    media_type?: 'image' | 'video' | 'audio' | null;
    poll?: {
      question: string;
      options: Array<{
        id: string;
        content: string;
        votes: number;
      }>;
      total_votes: number;
      user_vote: string | null;
    } | null;
    idea?: {
      title: string;
      description: string;
      participants: Array<{
        user_id: string;
        profession: string;
        joined_at: string;
        username?: string;
        avatar_url?: string;
      }>;
    } | null;
    visibility?: 'public' | 'friends' | 'incognito';
    created_at?: string;
    updated_at?: string;
    shared_from?: string | null;
    shared_post_id?: string | null;
    shared_post_author?: string | null;
  };
  Update: {
    id?: string;
    content?: string;
    user_id?: string;
    media_url?: string | null;
    media_type?: 'image' | 'video' | 'audio' | null;
    poll?: {
      question: string;
      options: Array<{
        id: string;
        content: string;
        votes: number;
      }>;
      total_votes: number;
      user_vote: string | null;
    } | null;
    idea?: {
      title: string;
      description: string;
      participants: Array<{
        user_id: string;
        profession: string;
        joined_at: string;
        username?: string;
        avatar_url?: string;
      }>;
    } | null;
    visibility?: 'public' | 'friends' | 'incognito';
    created_at?: string;
    updated_at?: string;
    shared_from?: string | null;
    shared_post_id?: string | null;
    shared_post_author?: string | null;
  };
}

export interface CommentTable {
  Row: {
    id: string;
    content: string;
    user_id: string;
    post_id: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    content: string;
    user_id: string;
    post_id: string;
    parent_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    content?: string;
    user_id?: string;
    post_id?: string;
    parent_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}
