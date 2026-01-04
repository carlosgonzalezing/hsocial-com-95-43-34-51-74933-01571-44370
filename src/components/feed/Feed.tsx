import { FeedSkeleton } from "./FeedSkeleton";
import { EmptyFeed } from "./EmptyFeed";
import { Post } from "@/types/post";
import { FeedContent } from "./FeedContent";
import { usePersonalizedFeed } from "@/hooks/feed/use-personalized-feed";
import { useRealtimeFeedSimple } from "@/hooks/feed/hooks/use-realtime-feed-simple";
import { useEffect } from "react";
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

      {hasNextPage && (
        <div className="py-4 flex justify-center">
          <button
            type="button"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
}