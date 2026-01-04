import { FeedSkeleton } from "./FeedSkeleton";
import { EmptyFeed } from "./EmptyFeed";
import { Post } from "@/types/post";
import { FeedContent } from "./FeedContent";
import { usePersonalizedFeed } from "@/hooks/feed/use-personalized-feed";
import { useRealtimeFeedSimple } from "@/hooks/feed/hooks/use-realtime-feed-simple";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface FeedProps {
  userId?: string;
  groupId?: string;
  companyId?: string;
}

export function Feed({ userId, groupId, companyId }: FeedProps) {
  const queryClient = useQueryClient();
  const {
    posts,
    isLoading,
    trackPostView,
    trackPostInteraction,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePersonalizedFeed(userId, groupId, companyId);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Set up real-time subscriptions for feed, reactions and comments
  useRealtimeFeedSimple(userId);

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["posts"], exact: false });
    };

    window.addEventListener('hsocial:home_refresh', handler);
    return () => window.removeEventListener('hsocial:home_refresh', handler);
  }, [queryClient]);

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (posts.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <div className="feed-container mx-auto w-full max-w-[680px] px-2 lg:px-0">
      <FeedContent
        posts={posts as Post[]}
        trackPostView={trackPostView}
        trackPostInteraction={trackPostInteraction}
      />
      {/* Loader sentinel for IntersectionObserver */}
      <div ref={loaderRef} className="py-4 flex justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Cargando…
          </div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <div className="text-sm text-muted-foreground">Ya estás al día</div>
        )}
      </div>
    </div>
  );
}