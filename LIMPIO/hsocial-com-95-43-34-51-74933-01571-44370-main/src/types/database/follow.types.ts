
export interface ProfileHeartTable {
  id: string;
  profile_id: string;
  giver_id: string;
  created_at: string;
}

export interface PopularUserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  career: string | null;
  semester: string | null;
  followers_count: number;
  hearts_count?: number;
  is_premium?: boolean;
}
