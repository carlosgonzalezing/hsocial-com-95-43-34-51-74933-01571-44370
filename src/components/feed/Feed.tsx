import { FeedSkeleton } from "./FeedSkeleton";
import { EmptyFeed } from "./EmptyFeed";
import { Post } from "@/types/post";
import { FeedContent } from "./FeedContent";
import { QuickPostBox } from "./QuickPostBox";
import { usePersonalizedFeed } from "@/hooks/feed/use-personalized-feed";
import { useRealtimeFeedSimple } from "@/hooks/feed/hooks/use-realtime-feed-simple";

interface FeedProps {
  userId?: string;
}

export function Feed({ userId }: FeedProps) {
  const {
    posts,
    isLoading,
    trackPostView,
    trackPostInteraction
  } = usePersonalizedFeed(userId);

  // Set up real-time subscriptions for feed, reactions and comments
  useRealtimeFeedSimple(userId);

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (posts.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <div className="space-y-0 feed-container mx-auto w-full">
      <QuickPostBox />
      <FeedContent
        posts={posts as Post[]}
        trackPostView={trackPostView}
        trackPostInteraction={trackPostInteraction}
      />
    </div>
  );
}