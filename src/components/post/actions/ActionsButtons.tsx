import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ShareOptions } from "./ShareOptions";
import { MessageCircle, ThumbsUp, Send, Repeat2 } from "lucide-react";
import { Post } from "@/types/post";
import { ReactionType } from "@/types/database/social.types";
import { reactionIcons } from "../reactions/ReactionIcons";
import { ReactionMenu } from "../reactions/ReactionMenu";
import { useLongPress } from "../reactions/hooks/use-long-press";

interface ActionsButtonsProps {
  postId: string;
  userReaction: ReactionType | null;
  onComment: () => void;
  onShare?: () => void;
  compact?: boolean;
  handleReaction?: (type: ReactionType) => void;
  post?: Post;
  showJoinButton?: boolean;
  onJoinClick?: () => void;
  onReaction?: (id: string, type: ReactionType) => void;
  commentsExpanded?: boolean;
  sharesCount?: number;
}

export function ActionsButtons({
  userReaction,
  handleReaction,
  postId,
  onComment,
  onShare,
  compact = false,
  post,
  onReaction,
  commentsExpanded,
  sharesCount = 0
}: ActionsButtonsProps) {
  
  const handleReactionClick = (type: ReactionType) => {
    if (onReaction) {
      onReaction(postId, type);
    } else if (handleReaction) {
      handleReaction(type);
    }
  };

  const [animatingReaction, setAnimatingReaction] = useState<ReactionType | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { 
    showReactions, 
    activeReaction, 
    setActiveReaction, 
    setShowReactions, 
    handlePressStart, 
    handlePressEnd 
  } = useLongPress({
    onPressEnd: (reaction) => {
      if (reaction) {
        handleReactionClick(reaction);
        setAnimatingReaction(reaction);
      } else {
        const defaultReaction = userReaction || 'love';
        handleReactionClick(defaultReaction);
        setAnimatingReaction(defaultReaction);
      }
      setTimeout(() => setAnimatingReaction(null), 600);
      setShowReactions(false);
    }
  });

  const handleReactionButtonClick = useCallback(() => {
    if (!showReactions) {
      const reactionType = userReaction || 'love';
      handleReactionClick(reactionType);
      setAnimatingReaction(reactionType);
      setTimeout(() => setAnimatingReaction(null), 600);
    }
  }, [userReaction, showReactions]);

  const handleReactionSelected = useCallback((type: ReactionType) => {
    setAnimatingReaction(type);
    setTimeout(() => setAnimatingReaction(null), 600);
    handleReactionClick(type);
    setShowReactions(false);
  }, [setShowReactions]);

  const hasReacted = userReaction !== null;
  const reactionData = hasReacted ? reactionIcons[userReaction] : null;

  return (
    <div className="px-3 py-1 border-t border-border/50">
      <div className="flex items-center justify-between">
        {/* Reaction button */}
        <div className="relative flex-1">
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-2 z-50">
              <ReactionMenu
                show={showReactions}
                activeReaction={activeReaction}
                setActiveReaction={setActiveReaction}
                onReactionSelected={handleReactionSelected}
                onPointerLeave={() => setActiveReaction(null)}
              />
            </div>
          )}

          <Button
            ref={buttonRef}
            variant="ghost"
            size="sm"
            className={`w-full h-10 hover:bg-muted/50 gap-2 ${hasReacted ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={handleReactionButtonClick} 
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerLeave={handlePressEnd}
          >
            {hasReacted && reactionData ? (
              <span className={`text-lg leading-none ${animatingReaction === userReaction ? reactionData.animationClass : ''}`}>
                {reactionData.emoji}
              </span>
            ) : (
              <ThumbsUp className="h-5 w-5" strokeWidth={1.5} />
            )}
            <span className="text-sm font-medium hidden sm:inline">
              {hasReacted ? 'Te gusta' : 'Me gusta'}
            </span>
          </Button>
        </div>
        
        {/* Comment button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-10 hover:bg-muted/50 gap-2 text-muted-foreground"
          onClick={onComment}
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
          <span className="text-sm font-medium hidden sm:inline">Comentar</span>
        </Button>
        
        {/* Repost button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-10 hover:bg-muted/50 gap-2 text-muted-foreground"
          onClick={onShare}
        >
          <Repeat2 className="h-5 w-5" strokeWidth={1.5} />
          <span className="text-sm font-medium hidden sm:inline">Compartir</span>
        </Button>
        
        {/* Send button */}
        {post ? (
          <ShareOptions post={post}>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-10 hover:bg-muted/50 gap-2 text-muted-foreground"
            >
              <Send className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm font-medium hidden sm:inline">Enviar</span>
            </Button>
          </ShareOptions>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-10 hover:bg-muted/50 gap-2 text-muted-foreground"
            onClick={onShare}
          >
            <Send className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-sm font-medium hidden sm:inline">Enviar</span>
          </Button>
        )}
      </div>
    </div>
  );
}
