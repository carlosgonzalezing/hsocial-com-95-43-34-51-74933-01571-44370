import { useQuery } from "@tanstack/react-query";
import { QueryOptimizer } from "@/lib/query-optimization";
import { cacheManager } from "@/lib/cache-manager";
import { usePerformanceMonitor } from "./use-performance-monitor";

export function useOptimizedFeed(userId?: string, limit = 20) {
  const { markRenderStart, markRenderEnd } = usePerformanceMonitor();

  return useQuery({
    queryKey: ["optimized-posts", userId, limit],
    queryFn: async () => {
      markRenderStart();
      
      // Check cache first
      const cacheKey = `posts-${userId}-${limit}`;
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        markRenderEnd();
        return cached;
      }

      // Fetch optimized posts
      const { data: posts } = await QueryOptimizer.getOptimizedPostsQuery(userId, limit);
      
      if (!posts) {
        markRenderEnd();
        return [];
      }

      // Prefetch related data
      const enrichedPosts = await QueryOptimizer.prefetchPostsData(posts);
      
      // Cache the result
      cacheManager.set(cacheKey, enrichedPosts, 3 * 60 * 1000); // 3 minutes
      
      markRenderEnd();
      
      return enrichedPosts;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });
}