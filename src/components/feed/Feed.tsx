import { FeedSkeleton } from "./FeedSkeleton";
import { EmptyFeed } from "./EmptyFeed";
import { PublicFeedWall } from "./PublicFeedWall";
import type { Post } from "@/types/post";
import { FeedContent } from "./FeedContent";
import { usePersonalizedFeed } from "@/hooks/feed/use-personalized-feed";
import { useRealtimeFeedSimple } from "@/hooks/feed/hooks/use-realtime-feed-simple";
import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { getPublicFeedPreview } from "@/lib/api";

function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  let parent: HTMLElement | null = el.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflow = style.overflow;
    const isScrollable =
      overflowY === "auto" || overflowY === "scroll" || overflow === "auto" || overflow === "scroll";
    if (isScrollable) return parent;
    parent = parent.parentElement;
  }
  return null;
}

interface FeedProps {
  userId?: string;
  groupId?: string;
  companyId?: string;
}

export function Feed({ userId, groupId, companyId }: FeedProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const {
    data: publicPreview,
    isLoading: isPublicLoading,
    isError: isPublicError,
  } = useQuery({
    queryKey: ["posts", "public-preview"],
    queryFn: () => getPublicFeedPreview(5),
    enabled: !isAuthenticated,
    staleTime: 1000 * 60, // 1 minute
  });

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

  const maybeLoadMore = useCallback(() => {
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!hasNextPage) return;

    const rootEl = loaderRef.current ? getScrollParent(loaderRef.current) : null;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) maybeLoadMore();
      },
      { root: rootEl ?? null, rootMargin: "200px" }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    const checkIfSentinelVisible = () => {
      if (!loaderRef.current) return;
      const rect = loaderRef.current.getBoundingClientRect();

      if (!rootEl) {
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top <= viewportHeight + 200) {
          maybeLoadMore();
        }
        return;
      }

      const rootRect = rootEl.getBoundingClientRect();
      if (rect.top <= rootRect.bottom + 200) {
        maybeLoadMore();
      }
    };

    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        checkIfSentinelVisible();
      });
    };

    // If the page isn't tall enough (common on mobile), trigger immediately
    const t = window.setTimeout(checkIfSentinelVisible, 0);

    const scrollTarget: any = rootEl ?? window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.clearTimeout(t);
      scrollTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
      }
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
      observer.disconnect();
    };
  }, [isAuthenticated, hasNextPage, maybeLoadMore, posts.length]);

  // Set up real-time subscriptions for feed, reactions and comments
  useRealtimeFeedSimple(isAuthenticated ? userId : undefined);

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["posts"], exact: false });
    };

    window.addEventListener('hsocial:home_refresh', handler);
    return () => window.removeEventListener('hsocial:home_refresh', handler);
  }, [queryClient]);

  if (!isAuthenticated) {
    if (isPublicLoading) {
      return <FeedSkeleton />;
    }

    if (isPublicError) {
      return <EmptyFeed />;
    }

    const previewPosts = (publicPreview?.posts || []) as Post[];
    if (previewPosts.length === 0) {
      return <EmptyFeed />;
    }

    return (
      <div className="feed-container mx-auto w-full max-w-[680px] px-2 lg:px-0">
        <FeedContent
          posts={previewPosts}
          trackPostView={async () => {}}
          trackPostInteraction={async () => {}}
        />
        <div className="mt-6">
          <PublicFeedWall />
        </div>
      </div>
    );
  }

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