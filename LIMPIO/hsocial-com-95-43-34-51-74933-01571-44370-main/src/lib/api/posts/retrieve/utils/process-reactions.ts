
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches reactions data for a set of posts
 */
async function fetchReactionsForPosts(postIds: string[], userId?: string) {
  if (postIds.length === 0) return {};
  
  const { data: reactions } = await supabase
    .from("reactions")
    .select("id, post_id, reaction_type, user_id")
    .in("post_id", postIds);
    
  if (!reactions) return {};
  
  // Group reactions by post_id
  const reactionsByPost: Record<string, any> = {};
  
  reactions.forEach(reaction => {
    if (!reactionsByPost[reaction.post_id]) {
      reactionsByPost[reaction.post_id] = {
        count: 0,
        by_type: {} as Record<string, number>,
        recent_users: [] as string[],
        user_reaction: null
      };
    }
    
    const postReactions = reactionsByPost[reaction.post_id];
    postReactions.count++;
    
    const type = reaction.reaction_type;
    if (!postReactions.by_type[type]) {
      postReactions.by_type[type] = 0;
    }
    postReactions.by_type[type]++;
    
    if (reaction.user_id) {
      postReactions.recent_users.push(reaction.user_id);
    }
    
    if (userId && reaction.user_id === userId) {
      postReactions.user_reaction = reaction.reaction_type;
    }
  });
  
  return reactionsByPost;
}

/**
 * Processes reactions data for posts
 */
export async function processReactions(posts: any[], userId?: string) {
  // Get all post IDs
  const postIds = posts.map(p => p.id).filter(Boolean);
  
  // Fetch reactions for all posts at once
  const reactionsByPost = await fetchReactionsForPosts(postIds, userId);
  
  return posts.map(post => {
    // Get reactions for this post or use default
    const reactions = reactionsByPost[post.id] || {
      count: 0,
      by_type: {} as Record<string, number>,
      recent_users: [] as string[],
      user_reaction: null
    };
    
    return {
      ...post,
      reactions,
      reactions_count: reactions.count,
      user_reaction: reactions.user_reaction
    };
  });
}
