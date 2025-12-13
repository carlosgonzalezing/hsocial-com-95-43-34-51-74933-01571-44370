
export interface Friend {
  // Primary properties (new standard)
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends_count?: number;
  status?: 'following' | 'follower' | 'friends';
  
  // Legacy properties (for compatibility with existing components)
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
  
  // Online status properties
  last_seen?: string | null;
  online_status?: 'online' | 'offline' | 'away' | null;
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'accepted' | 'pending' | 'rejected';
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
  mutual_friends?: {
    username: string;
    avatar_url: string | null;
  }[];
}

export interface FriendSuggestion {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends_count: number;
  career?: string | null;
  semester?: string | null;
  careerMatch?: boolean;
  semesterMatch?: boolean;
  relevanceScore?: number;
  mutual_friends?: {
    username: string;
    avatar_url: string | null;
  }[];
}
