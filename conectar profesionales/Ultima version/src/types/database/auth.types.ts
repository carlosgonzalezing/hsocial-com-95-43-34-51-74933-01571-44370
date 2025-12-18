
export interface User {
  id: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  created_at: string;
  expires_at?: string;
}
