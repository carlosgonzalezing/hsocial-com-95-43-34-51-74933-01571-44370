import { supabase } from "@/integrations/supabase/client";

export class QueryOptimizer {
  // Batch multiple queries together
  static async batchQueries<T>(queries: (() => Promise<T>)[]): Promise<T[]> {
    return Promise.all(queries.map(query => query()));
  }

  // Get optimized posts query with proper indexing
  static getOptimizedPostsQuery(userId?: string, limit = 20) {
    let query = supabase
      .from('posts')
      .select(`
        id,
        content,
        media_url,
        media_type,
        post_type,
        created_at,
        user_id,
        visibility,
        poll,
        idea,
        marketplace,
        is_pinned,
        profiles!inner(
          id,
          username,
          avatar_url,
          career,
          semester
        )
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.or(`user_id.eq.${userId},visibility.eq.public`);
    }

    return query;
  }

  // Optimized reactions count query
  static async getReactionsCounts(postIds: string[]) {
    if (postIds.length === 0) return {};

    const { data } = await supabase
      .from('reactions')
      .select('post_id, reaction_type')
      .in('post_id', postIds);

    const counts: Record<string, Record<string, number>> = {};
    
    data?.forEach(reaction => {
      if (!counts[reaction.post_id]) {
        counts[reaction.post_id] = {};
      }
      counts[reaction.post_id][reaction.reaction_type] = 
        (counts[reaction.post_id][reaction.reaction_type] || 0) + 1;
    });

    return counts;
  }

  // Optimized comments count query
  static async getCommentsCounts(postIds: string[]) {
    if (postIds.length === 0) return {};

    const { data } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);

    const counts: Record<string, number> = {};
    
    data?.forEach(comment => {
      counts[comment.post_id] = (counts[comment.post_id] || 0) + 1;
    });

    return counts;
  }

  // Prefetch related data for posts
  static async prefetchPostsData(posts: any[]) {
    const postIds = posts.map(p => p.id);
    
    const [reactionsCounts, commentsCounts] = await Promise.all([
      this.getReactionsCounts(postIds),
      this.getCommentsCounts(postIds)
    ]);

    return posts.map(post => ({
      ...post,
      reactions_count: reactionsCounts[post.id] || {},
      comments_count: commentsCounts[post.id] || 0
    }));
  }

  // Optimized batch operations
  static async executeBatch<T>(
    operations: (() => Promise<T>)[],
    batchSize = 3
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
    }
    
    return results;
  }

  // Debounced search query
  static debounce<T extends (...args: any[]) => any>(
    func: T, 
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
}