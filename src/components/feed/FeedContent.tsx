import { PostCardWithTracking } from "./PostCardWithTracking";
import { UnifiedPostCard } from "@/components/UnifiedPostCard";
import { PeopleYouMayKnow } from "@/components/friends/PeopleYouMayKnow";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Post } from "@/types/post";

interface FeedContentProps {
  posts: Post[];
  trackPostView?: (postId: string, duration?: number) => void;
  trackPostInteraction?: (postId: string, type: 'like' | 'comment' | 'share') => void;
}

export function FeedContent({ 
  posts,
  trackPostView,
  trackPostInteraction
}: FeedContentProps) {
  const isMobile = useIsMobile();
  
  // Solo mostrar posts reales de la base de datos
  const allPosts = posts;
  
  const renderFeedPosts = () => {
    const feedContent = [];
    
    // Distribute posts with ads and recommendations
    for (let i = 0; i < allPosts.length; i++) {
      const post = allPosts[i];
      
      // Add post with tracking
      feedContent.push(
        <div key={post.id} className="mb-0 w-full">
          <UnifiedPostCard 
            post={post} 
            isInFeed={true}
            trackPostView={trackPostView}
            trackPostInteraction={trackPostInteraction}
          />
        </div>
      );
      
      // Add People You May Know after 5 posts on desktop, after 6 on mobile
      if ((isMobile ? i === 6 : i === 4) && !feedContent.some(item => item.key === "people-you-may-know")) {
        feedContent.push(
          <div key="people-you-may-know" className="mb-0 w-full px-0 md:px-4">
            <PeopleYouMayKnow />
          </div>
        );
      }

      // Ad slots removed for better performance
    }
    
    return feedContent;
  };

  return (
    <div className="space-y-4 w-full">
      {renderFeedPosts()}
    </div>
  );
}
