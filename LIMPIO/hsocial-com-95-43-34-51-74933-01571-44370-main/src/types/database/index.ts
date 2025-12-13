
// Use export type for type re-exports with isolatedModules
export type { User, Profile, Session } from './auth.types';
export type { PostTable } from './posts.types';
export type { ReactionType, Notification, FriendshipStatus, Friendship } from './social.types';
export type { JsonPrimitive, JsonObject, JsonArray, JsonValue, Json } from './json.types';

// Define Tables interface for database access
export interface Tables {
  reactions: {
    id: string;
    post_id: string;
    user_id: string;
    reaction_type: string;
    created_at: string;
  };
  friendships: {
    id: string;
    user_id: string;
    friend_id: string;
    status: string;
    created_at: string;
    updated_at?: string;
  };
  notifications: {
    id: string;
    user_id: string;
    type: string;
    content: string;
    read: boolean;
    created_at: string;
    related_id?: string;
    sender_id?: string;
    receiver_id?: string;
    message?: string;
    comment_id?: string;
    post_id?: string;
  };
  posts: {
    id: string;
    content?: string;
    user_id: string;
    media_url?: string;
    media_type?: string;
    visibility: string;
    created_at: string;
    updated_at: string;
    shared_post_id?: string;
    shared_from?: string;
    poll?: any;
    idea?: any;
    profiles?: { username?: string; avatar_url?: string };
  };
}
