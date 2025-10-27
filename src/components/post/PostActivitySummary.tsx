import React from "react";
import { ReactionSummary } from "./reactions/ReactionSummary";
import { Post } from "@/types/post";

interface PostActivitySummaryProps {
  post: Post;
  reactionsByType: Record<string, number>;
  commentsCount: number;
  sharesCount: number;
  onCommentsClick?: () => void;
}

export function PostActivitySummary({
  post,
  reactionsByType,
  commentsCount,
  sharesCount,
  onCommentsClick,
}: PostActivitySummaryProps) {
  const totalReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0);
  const hasActivity = totalReactions > 0 || commentsCount > 0 || sharesCount > 0;

  if (!hasActivity) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-b border-border/30">
      {/* Reactions and activity counters - Instagram style */}
      <div className="flex items-center justify-between">
        {/* Left: Reactions with emojis and total count */}
        {totalReactions > 0 && (
          <div className="flex items-center gap-2">
            <ReactionSummary reactions={reactionsByType} postId={post.id} />
          </div>
        )}
        
        {/* Right: Comments and shares count */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground ml-auto">
          {commentsCount > 0 && (
            <button 
              onClick={onCommentsClick} 
              className="hover:text-foreground transition-colors hover:underline"
            >
              {commentsCount} {commentsCount === 1 ? 'comentario' : 'comentarios'}
            </button>
          )}
          {sharesCount > 0 && (
            <span>
              {sharesCount} {sharesCount === 1 ? 'compartido' : 'compartidos'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}