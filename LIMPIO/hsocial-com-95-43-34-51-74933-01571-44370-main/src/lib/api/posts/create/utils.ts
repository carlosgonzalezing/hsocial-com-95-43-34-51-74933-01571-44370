
import { Post } from "@/types/post";
import { transformPoll } from "../utils";

/**
 * Validates and returns a safe visibility setting
 */
export function validateVisibility(visibility: string): "public" | "friends" | "private" | "incognito" {
  // Make sure visibility is one of the allowed values
  const allowedVisibilities: Array<"public" | "friends" | "private" | "incognito"> = ["public", "friends", "private", "incognito"];
  
  if (allowedVisibilities.includes(visibility as any)) {
    return visibility as "public" | "friends" | "private" | "incognito";
  }
  
  // Default to public if an invalid value is provided
  return "public";
}

/**
 * Transforms raw post data into a consistent Post object
 */
export function transformCreatedPost(rawPostData: any, userId: string): Post {
  return {
    id: rawPostData.id,
    content: rawPostData.content || '',
    user_id: rawPostData.user_id,
    created_at: rawPostData.created_at,
    updated_at: rawPostData.updated_at,
    media_url: rawPostData.media_url,
    media_type: rawPostData.media_type,
    visibility: rawPostData.visibility,
    poll: transformPoll(rawPostData.poll),
    idea: rawPostData.idea,
    shared_from: rawPostData.shared_from || null,
    shared_post_id: rawPostData.shared_post_id || null,
    reactions: [],
    reactions_count: 0,
    comments_count: 0,
    userHasReacted: false,
    user_reaction: null
  };
}
