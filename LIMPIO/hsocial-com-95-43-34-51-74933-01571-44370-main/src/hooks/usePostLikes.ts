import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePostLikes(postId: string, userId: string | undefined) {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial like status and count
  const fetchLikeStatus = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch like count
      const { count, error: countError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (countError) throw countError;
      setLikeCount(count || 0);

      // Check if current user has liked the post
      const { data, error: likeError } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (likeError && likeError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw likeError;
      }

      setIsLiked(!!data);
    } catch (error) {
      console.error('Error fetching like status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, userId]);

  // Toggle like status
  const toggleLike = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
          
        if (error) throw error;
        
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like the post (using 'like' as the default reaction type)
        const { error } = await supabase
          .from('likes')
          .insert([{ 
            post_id: postId, 
            user_id: userId,
            reaction_type: 'like' // Default reaction type
          }]);
          
        if (error) throw error;
        
        setLikeCount(prev => prev + 1);
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLiked, postId, userId]);

  // Initial fetch
  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus]);

  return {
    isLiked,
    likeCount,
    toggleLike,
    isLoading
  };
}

export default usePostLikes;
