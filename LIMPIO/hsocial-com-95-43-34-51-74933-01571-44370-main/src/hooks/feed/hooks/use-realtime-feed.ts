
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformPostData } from "@/lib/api/posts/retrieve/utils";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@/types/post";

export function useRealtimeFeed(userId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel for real-time updates
    const channel = supabase
      .channel('posts_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          console.log('New post detected:', payload.new);
          
          try {
            // Transform the new post data
            const transformedPost = await transformPostData(payload.new);
            
            // Get current posts from cache
            const queryKey = ["posts", userId];
            const currentPosts = queryClient.getQueryData<Post[]>(queryKey) || [];
            
            // Check if this is the user's own post to avoid duplicates
            const { data: { user } } = await supabase.auth.getUser();
            const isOwnPost = user?.id === payload.new.user_id;
            
            // Add new post to the beginning of the list if it's not already there
            const postExists = currentPosts.some(post => post.id === transformedPost.id);
            
            if (!postExists) {
              const updatedPosts = [transformedPost, ...currentPosts];
              queryClient.setQueryData(queryKey, updatedPosts);
              
              // Show toast notification for new posts (except own posts)
              if (!isOwnPost) {
                toast({
                  title: "Nueva publicación",
                  description: `${transformedPost.profiles?.username || 'Alguien'} ha creado una nueva publicación`,
                  duration: 3000,
                });
              }
            }
          } catch (error) {
            console.error('Error processing new post:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Post deleted:', payload.old);
          
          // Remove deleted post from cache
          const queryKey = ["posts", userId];
          const currentPosts = queryClient.getQueryData<Post[]>(queryKey) || [];
          const updatedPosts = currentPosts.filter(post => post.id !== payload.old.id);
          queryClient.setQueryData(queryKey, updatedPosts);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          console.log('Post updated:', payload.new);
          
          try {
            // Transform the updated post data
            const transformedPost = await transformPostData(payload.new);
            
            // Update the specific post in cache
            const queryKey = ["posts", userId];
            const currentPosts = queryClient.getQueryData<Post[]>(queryKey) || [];
            const updatedPosts = currentPosts.map(post => 
              post.id === transformedPost.id ? transformedPost : post
            );
            queryClient.setQueryData(queryKey, updatedPosts);
          } catch (error) {
            console.error('Error processing updated post:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Posts realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Posts realtime successfully subscribed');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('❌ Posts realtime subscription failed:', status);
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, queryClient, toast]);

  return {
    // This hook manages subscriptions in the background
  };
}
