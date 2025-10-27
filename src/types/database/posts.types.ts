
import { ReactionType } from "./social.types";
import { Json } from "./json.types";

export interface PostTable {
  Row: {
    id: string;
    content: string | null;
    user_id: string;
    media_url: string | null;
    media_type: 'image' | 'video' | 'audio' | null;
    visibility: 'public' | 'friends' | 'private' | 'incognito';
    created_at: string;
    updated_at: string;
    shared_post_id: string | null;
    shared_from: string | null;
    post_type: string | null;
    is_pinned: boolean | null;
    profiles: {
      username?: string;
      avatar_url?: string;
      id?: string;
    } | null;
    poll: Json | null;
    idea: Json | null;
    marketplace: Json | null;
  };
  Insert: {
    id?: string;
    content?: string | null;
    user_id: string;
    media_url?: string | null;
    media_type?: 'image' | 'video' | 'audio' | null;
    visibility?: 'public' | 'friends' | 'private' | 'incognito';
    created_at?: string;
    updated_at?: string;
    shared_post_id?: string | null;
    shared_from?: string | null;
    post_type?: string | null;
    is_pinned?: boolean | null;
    poll?: Json | null;
    idea?: Json | null;
    marketplace?: Json | null;
  };
  Update: {
    id?: string;
    content?: string | null;
    user_id?: string;
    media_url?: string | null;
    media_type?: 'image' | 'video' | 'audio' | null;
    visibility?: 'public' | 'friends' | 'private' | 'incognito';
    created_at?: string;
    updated_at?: string;
    shared_post_id?: string | null;
    shared_from?: string | null;
    post_type?: string | null;
    is_pinned?: boolean | null;
    poll?: Json | null;
    idea?: Json | null;
    marketplace?: Json | null;
  };
}
