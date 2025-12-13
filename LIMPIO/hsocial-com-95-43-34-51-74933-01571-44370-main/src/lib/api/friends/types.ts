
export interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
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
}

export type FriendshipStatus = 'friends' | 'following' | 'follower' | 'pending' | 'request_received' | null;
