
export interface ReportTable {
  Row: {
    id: string;
    post_id: string;
    user_id: string;
    reason: 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';
    description: string | null;
    status: 'pending' | 'reviewed' | 'ignored' | 'accepted';
    created_at: string;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    post_id: string;
    user_id: string;
    reason: 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';
    description?: string | null;
    status?: 'pending' | 'reviewed' | 'ignored' | 'accepted';
    created_at?: string;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    post_id?: string;
    user_id?: string;
    reason?: 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';
    description?: string | null;
    status?: 'pending' | 'reviewed' | 'ignored' | 'accepted';
    created_at?: string;
    updated_at?: string | null;
  };
}

export interface ReportWithUser {
  id: string;
  post_id: string;
  user_id: string;
  reason: 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';
  description: string | null;
  status: 'pending' | 'reviewed' | 'ignored' | 'accepted';
  created_at: string;
  updated_at: string | null;
  user: {
    username: string | null;
    avatar_url: string | null;
  };
}

export interface ReportedPost {
  post_id: string;
  count: number;
  posts: {
    id: string;
    content: string;
    user_id: string;
    media_url: string | null;
    media_type: string | null;
    created_at: string;
    profiles: {
      username: string | null;
      avatar_url: string | null;
    }
  }
}
