import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Global state to prevent multiple interaction subscriptions
let interactionSubscriptionsActive = false;

export function useRealtimeInteractions(userId?: string) {
  const queryClient = useQueryClient();
  const channelsRef = useRef<any[]>([]);
  const isSubscribedRef = useRef(false);
  const throttleTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Prevent multiple subscriptions and ensure we have a userId
    if (!userId || interactionSubscriptionsActive || isSubscribedRef.current) {
      console.log('⚡ Skipping interaction subscriptions - already active or no userId');
      return;
    }

    console.log('⚡ Setting up realtime interactions...');
    interactionSubscriptionsActive = true;
    isSubscribedRef.current = true;

    // Clean up existing subscriptions
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    try {
      // Create reactions channel with throttling
      const reactionsChannel = supabase
        .channel(`reactions_interactions_${userId.slice(-8)}_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reactions'
          },
          (payload) => {
            console.log('❤️ Reaction change detected:', payload.new);
            
            // Throttle updates to prevent excessive invalidations - increased for better performance
            clearTimeout(throttleTimeoutRef.current);
            throttleTimeoutRef.current = setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ["posts"], exact: false });
            }, 5000); // 5 second throttle for better performance
          }
        )
        .subscribe((status) => {
          console.log('❤️ Reactions subscription status:', status);
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('❌ Reactions subscription failed:', status);
          }
        });

      // Create comments channel with throttling
      const commentsChannel = supabase
        .channel(`comments_interactions_${userId.slice(-8)}_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'comments'
          },
            (payload) => {
              console.log('💬 Comment change detected:', payload.new);
              
              if (payload.new && typeof payload.new === 'object' && 'post_id' in payload.new) {
                // Throttle updates and target specific post comments - increased for better performance
                clearTimeout(throttleTimeoutRef.current);
                throttleTimeoutRef.current = setTimeout(() => {
                  queryClient.invalidateQueries({ 
                    queryKey: ["comments", (payload.new as any).post_id] 
                  });
                  queryClient.invalidateQueries({ queryKey: ["posts"], exact: false });
                }, 5000); // 5 second throttle for better performance
              }
            }
        )
        .subscribe((status) => {
          console.log('💬 Comments subscription status:', status);
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('❌ Comments subscription failed:', status);
          }
        });

      channelsRef.current = [reactionsChannel, commentsChannel];

    } catch (error) {
      console.error('❌ Error setting up realtime interactions:', error);
    }

    // Cleanup on unmount
    return () => {
      console.log('⚡ Cleaning up realtime interactions...');
      
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      
      channelsRef.current.forEach(channel => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
      });
      channelsRef.current = [];
      interactionSubscriptionsActive = false;
      isSubscribedRef.current = false;
    };
  }, [userId, queryClient]);

  return {
    // This hook manages interaction subscriptions in the background
  };
}