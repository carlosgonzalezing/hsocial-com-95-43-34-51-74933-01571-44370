import { useState, useEffect, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { personalizedFeedAlgorithm } from "@/lib/feed/personalized-algorithm";
import { getPostsPage } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/types/post";

export function usePersonalizedFeed(userId?: string, groupId?: string, companyId?: string) {
  const [isPersonalized, setIsPersonalized] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const PAGE_SIZE = 20;

  const {
    data,
    isLoading: postsLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", userId, groupId, companyId, "infinite"],
    queryFn: ({ pageParam }) =>
      getPostsPage({
        userId,
        groupId,
        companyId,
        limit: PAGE_SIZE,
        cursor: (pageParam as string | null | undefined) ?? null,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
    enabled: true,
  });

  const rawPosts = useMemo(() => {
    const flat = (data?.pages || []).flatMap((p) => p?.posts || []) as Post[];
    // Ensure stable ordering
    return flat.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [data]);

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
        return rawPosts.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    },
    enabled: !!currentUserId && rawPosts.length > 0 && isPersonalized,
  });

  const feedPosts = useMemo(() => {
    if (!isPersonalized) {
      return rawPosts.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return personalizedPosts;
  }, [isPersonalized, rawPosts, personalizedPosts]);

  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);

  useEffect(() => {
    const getHiddenData = async () => {
      if (!currentUserId) return;
      
      try {
        const { data: hiddenPosts } = await supabase
          .from('hidden_posts')
          .select('post_id')
          .eq('user_id', currentUserId);

        setHiddenPostIds(hiddenPosts?.map(h => h.post_id) || []);
      } catch (error) {
        console.error("Error fetching hidden data:", error);
      }
    };
    
    getHiddenData();
  }, [currentUserId]);

  const visiblePosts = feedPosts.filter((post: any) => 
    !hiddenPostIds.includes(post.id)
  );

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
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    trackPostView,
    trackPostInteraction,
    rawPostsCount: rawPosts.length,
    personalizedPostsCount: personalizedPosts.length,
    hiddenPostsCount: hiddenPostIds.length
  };
}

// Stub analytics hook (engagement_rewards_log table removed)
export function useFeedAnalytics() {
  return {
    avgViewTime: 0,
    interactionsToday: 0,
    personalizedAccuracy: 0
  };
}
