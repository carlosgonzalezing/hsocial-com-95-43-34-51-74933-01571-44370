
import { Post } from "@/types/post";
import { transformPoll } from "../utils";

/**
 * Transforma datos de encuestas
 * @param pollData Datos raw de la encuesta
 */
export function transformPollData(pollData: any) {
  if (!pollData) return null;
  return transformPoll(pollData);
}

/**
 * Procesa datos de reacciones para crear mapeos por post
 */
export function processReactionsData(reactionsData: Array<{ post_id: string; reaction_type: string }>) {
  return reactionsData.reduce((acc, reaction) => {
    if (!acc[reaction.post_id]) {
      acc[reaction.post_id] = { count: 0, by_type: {} };
    }
    acc[reaction.post_id].count++;
    acc[reaction.post_id].by_type[reaction.reaction_type] = 
      (acc[reaction.post_id].by_type[reaction.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, { count: number; by_type: Record<string, number> }>);
}

/**
 * Procesa datos de comentarios para crear conteos por post
 */
export function processCommentsData(commentsData: Array<{ post_id: string }>) {
  return commentsData.reduce((acc, comment) => {
    acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Actualiza datos de encuestas con los votos del usuario
 */
export function updatePollsWithUserVotes(rawPosts: any[], votesMap: Record<string, string>) {
  rawPosts.forEach(post => {
    if (!post) return;
    
    if (post.poll && typeof post.poll === 'object') {
      // Comprobación de tipos segura
      const pollObj = post.poll as Record<string, any>;
      pollObj.user_vote = votesMap[post.id] || null;
    }
  });
}

/**
 * Transforma datos brutos de posts en objetos Post con todos los datos necesarios
 */
export function transformPostsData(
  rawPosts: any[],
  reactionsMap: Record<string, { count: number; by_type: Record<string, number> }>,
  commentsCountMap: Record<string, number>,
  userReactionsMap: Record<string, string>
): Post[] {
  return rawPosts.map((post): Post => {
    if (!post) return {} as Post;

    // Create a post object with all required fields
    const transformedPost: Post = {
      id: post.id,
      content: post.content || '',
      user_id: post.user_id,
      media_url: post.media_url,
      media_type: post.media_type,
      visibility: post.visibility,
      created_at: post.created_at,
      updated_at: post.updated_at,
      profiles: post.profiles,
      poll: transformPollData(post.poll),
      shared_from: post.shared_from || null,
      shared_post_id: post.shared_post_id || null,
      shared_post: post.shared_post || null,
      user_reaction: userReactionsMap[post.id],
      idea: post.idea,
      comments_count: commentsCountMap[post.id] || 0,
      userHasReacted: !!userReactionsMap[post.id]
    };

    // Add reactions data - ensure we're using a compatible format that works with Post type
    if (reactionsMap[post.id]) {
      transformedPost.reactions = reactionsMap[post.id];
      transformedPost.reactions_count = reactionsMap[post.id].count;
    } else {
      transformedPost.reactions = { count: 0, by_type: {} };
      transformedPost.reactions_count = 0;
    }

    return transformedPost;
  });
}
