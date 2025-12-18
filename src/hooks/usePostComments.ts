import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CommentAuthor {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  profiles: CommentAuthor;
}

export function usePostComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments for the post
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:profiles!inner(
            id,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('No se pudieron cargar los comentarios');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  // Add a new comment
  const addComment = useCallback(async (content: string, userId: string) => {
    try {
      if (!content.trim()) return;
      
      const { data: newComment, error: insertError } = await supabase
        .from('comments')
        .insert([
          { 
            content,
            post_id: postId,
            user_id: userId 
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      
      // Fetch the new comment with author info
      const { data: commentWithAuthor, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:profiles!inner(
            id,
            username,
            avatar_url
          )
        `)
        .eq('id', newComment.id)
        .single();

      if (fetchError) throw fetchError;
      
      setComments(prev => [...prev, commentWithAuthor]);
      return commentWithAuthor;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }, [postId]);

  // Initial fetch
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, fetchComments]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    refreshComments: fetchComments
  };
}

export default usePostComments;
