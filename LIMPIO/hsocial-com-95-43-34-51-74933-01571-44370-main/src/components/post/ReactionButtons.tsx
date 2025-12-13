import React from "react";
import { HoverReactionButton } from "./reactions/HoverReactionButton";
import { ReactionSummary } from "./reactions/ReactionSummary";
import { ReactionType } from "@/types/database/social.types";
import type { Post } from "@/types/post";
import { Button } from "@/components/ui/button";
import { usePostReactions } from "@/hooks/posts/use-post-reactions";

interface ReactionButtonsProps {
  post: Post;
  onReaction?: (type: string) => void;
}

export function ReactionButtons({ post, onReaction }: ReactionButtonsProps) {
  const { userReaction, onReaction: handleReaction } = usePostReactions(post.id);

  console.log("ReactionButtons Debug:", {
    postId: post.id,
    postUserReaction: post.user_reaction,
    hookUserReaction: userReaction,
    finalUserReaction: userReaction,
  });
  if (!post) {
    return null;
  }

  // Simplificar el procesamiento de reacciones
  const reactionsByType: Record<string, number> = {};

  if (Array.isArray(post.reactions)) {
    post.reactions.forEach((reaction: any) => {
      const type = reaction.reaction_type || reaction.type || "love";
      reactionsByType[type] = (reactionsByType[type] || 0) + 1;
    });
  }

  const hasReactions = Object.values(reactionsByType).reduce((sum, count) => sum + count, 0) > 0;

  return (
    <div className="flex items-center justify-start">
      {hasReactions && (
        <Button variant="ghost" size="sm" className="h-auto p-0 hover:underline">
          <ReactionSummary reactions={reactionsByType} postId={post.id} />
        </Button>
      )}
      <HoverReactionButton
        postId={post.id}
        userReaction={userReaction}
        onReactionClick={(type) => {
          console.log("ReactionButtons: Reaction clicked", type);
          handleReaction(post.id, type);
          onReaction?.(type);
        }}
        postType={post.post_type}
      />
    </div>
  );
}
