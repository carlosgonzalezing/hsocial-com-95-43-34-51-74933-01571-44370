import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { personalizedFeedAlgorithm } from "@/lib/feed/personalized-algorithm";
import { getPosts } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/types/post";

export function usePersonalizedFeed(userId?: string) {
  const [isPersonalized, setIsPersonalized] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch raw posts
  const { 
    data: rawPosts = [], 
    isLoading: postsLoading, 
    refetch 
  } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => getPosts(userId),
    enabled: !!currentUserId,
  });

  // Generate personalized feed
  const { 
    data: personalizedPosts = [], 
    isLoading: algorithLoading 
  } = useQuery({
    queryKey: ["personalized-feed", currentUserId, rawPosts.length],
    queryFn: async () => {
      if (!currentUserId || rawPosts.length === 0) return rawPosts;
      
      try {
        return await personalizedFeedAlgorithm.generatePersonalizedFeed(
          rawPosts as Post[], 
          currentUserId
        );
      } catch (error) {
        console.error('Error generating personalized feed:', error);
        // Fallback to chronological
        return rawPosts.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    },
    enabled: !!currentUserId && rawPosts.length > 0 && isPersonalized,
  });

  // Choose which feed to show
  const feedPosts = useMemo(() => {
    if (!isPersonalized) {
      // Chronological feed
      return rawPosts.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return personalizedPosts;
  }, [isPersonalized, rawPosts, personalizedPosts]);

  // Filter hidden posts
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [hiddenUserIds, setHiddenUserIds] = useState<string[]>([]);

  useEffect(() => {
    const getHiddenData = async () => {
      if (!currentUserId) return;
      
      try {
        const [hiddenPosts, hiddenUsers] = await Promise.all([
          supabase
            .from('hidden_posts')
            .select('post_id')
            .eq('user_id', currentUserId),
          supabase
            .from('hidden_users') 
            .select('hidden_user_id')
            .eq('user_id', currentUserId)
        ]);

        setHiddenPostIds(hiddenPosts.data?.map(h => h.post_id) || []);
        setHiddenUserIds(hiddenUsers.data?.map(h => h.hidden_user_id) || []);
      } catch (error) {
        console.error("Error fetching hidden data:", error);
      }
    };
    
    getHiddenData();
  }, [currentUserId]);

  const visiblePosts = feedPosts.filter((post: any) => 
    !hiddenPostIds.includes(post.id) && 
    !hiddenUserIds.includes(post.user_id || '')
  );

  // Track when user views posts (for algorithm learning)
  const trackPostView = async (postId: string, durationSeconds?: number) => {
    if (currentUserId) {
      await personalizedFeedAlgorithm.trackInteraction(
        postId, 
        'view', 
        durationSeconds
      );
    }
  };

  const trackPostInteraction = async (
    postId: string, 
    type: 'like' | 'comment' | 'share'
  ) => {
    if (currentUserId) {
      await personalizedFeedAlgorithm.trackInteraction(postId, type);
    }
  };

  return {
    posts: visiblePosts,
    isLoading: postsLoading || (isPersonalized && algorithLoading),
    isPersonalized,
    setIsPersonalized,
    refetch,
    trackPostView,
    trackPostInteraction,
    // Analytics for debugging
    rawPostsCount: rawPosts.length,
    personalizedPostsCount: personalizedPosts.length,
    hiddenPostsCount: hiddenPostIds.length + hiddenUserIds.length
  };
}

// Hook adicional para estadísticas del algoritmo
export function useFeedAnalytics() {
  const [stats, setStats] = useState({
    avgViewTime: 0,
    interactionsToday: 0,
    personalizedAccuracy: 0
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        
        // Get engagement data for today
        const { data: todayEngagement } = await supabase
          .from('engagement_rewards_log')
          .select('*')
          .eq('user_id', user.id)
          .gte('earned_at', today);

        const interactionsToday = todayEngagement?.filter(
          r => r.reward_type === 'interaction_tracking'
        ).length || 0;

        setStats({
          avgViewTime: 0, // This would need viewport tracking
          interactionsToday,
          personalizedAccuracy: 0 // This would need user feedback
        });

      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };

    loadAnalytics();
  }, []);

  return stats;
}