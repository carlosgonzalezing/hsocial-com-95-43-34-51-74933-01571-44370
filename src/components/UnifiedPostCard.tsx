import React from "react";
import { Post as PostComponent } from "@/components/Post";
import type { Post } from "@/types/post";

interface UnifiedPostCardProps {
  post: Post;
  isInFeed?: boolean;
  trackPostView?: (postId: string, duration?: number) => void;
  trackPostInteraction?: (postId: string, type: 'like' | 'comment' | 'share') => void;
}

export function UnifiedPostCard({ 
  post, 
  isInFeed = false,
  trackPostView,
  trackPostInteraction 
}: UnifiedPostCardProps) {
  
  // Solo mostramos posts regulares (texto, foto, video, ideas)
  // Oportunidades eliminadas
  return (
    <div className="mb-0 w-full">
      <PostComponent 
        post={post}
      />
    </div>
  );
}