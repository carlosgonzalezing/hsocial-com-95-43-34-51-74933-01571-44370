
export interface MatchProfile {
  id: string;
  username: string;
  avatar_url?: string | null;
  career?: string | null;
  semester?: string | null;
  bio?: string | null;
  compatibility_score: number;
  shared_interests: string[];
  mutual_friends_count: number;
  is_online?: boolean;
}

export interface DuoDinamico {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  is_active: boolean;
  duo_name?: string;
  profiles?: {
    user1: {
      username: string;
      avatar_url?: string;
    };
    user2: {
      username: string;
      avatar_url?: string;
    };
  };
}

export interface MatchAction {
  type: 'like' | 'pass' | 'super_like';
  target_user_id: string;
  created_at: string;
}
