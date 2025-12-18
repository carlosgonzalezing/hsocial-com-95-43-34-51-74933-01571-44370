import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
  onSend?: () => void;
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
  onSend,
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
    } else {
      // No handler provided
      return;
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
      }
      setTimeout(() => setAnimatingReaction(null), 600);
      setShowReactions(false);
    }
  });

  const handleReactionButtonClick = useCallback(() => {
    const reactionType = userReaction || 'love';
    handleReactionClick(reactionType);
    setAnimatingReaction(reactionType);
    setTimeout(() => setAnimatingReaction(null), 600);
  }, [userReaction]);

  const handleReactionSelected = useCallback((type: ReactionType) => {
    setAnimatingReaction(type);
    setTimeout(() => setAnimatingReaction(null), 600);
    handleReactionClick(type);
    setShowReactions(false);
  }, [setShowReactions]);

  const hasReacted = userReaction !== null;
  const reactionData = hasReacted ? reactionIcons[userReaction] : null;

  return (
    <div className="px-2 sm:px-3 py-2">
      <div className="flex items-center justify-between">
        {/* Reaction button */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => {
            setShowReactions(false);
            setActiveReaction(null);
          }}
        >
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
            className={`w-full h-11 sm:h-10 hover:bg-muted/50 gap-2 ${hasReacted ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={handleReactionButtonClick} 
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse') {
                handlePressStart();
              }
            }}
            onPointerUp={(e) => {
              if (e.pointerType !== 'mouse') {
                handlePressEnd();
              }
            }}
            onPointerLeave={(e) => {
              if (e.pointerType !== 'mouse') {
                handlePressEnd();
              }
            }}
          >
            {hasReacted && reactionData ? (
              <span className={`text-lg leading-none ${animatingReaction === userReaction ? reactionData.animationClass : ''}`}>
                {reactionData.emoji}
              </span>
            ) : (
              <ThumbsUp className="h-5 w-5" strokeWidth={1.5} />
            )}
            <span className="text-sm font-medium hidden sm:inline">
              {hasReacted && reactionData ? reactionData.label : 'Me gusta'}
            </span>
          </Button>
        </div>
        
        {/* Comment button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-11 sm:h-10 hover:bg-muted/50 gap-2 text-muted-foreground"
          onClick={onComment}
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
          <span className="text-sm font-medium hidden sm:inline">Comentar</span>
        </Button>
        
        {/* Repost button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-11 sm:h-10 hover:bg-muted/50 gap-2 text-muted-foreground"
          onClick={onShare}
        >
          <Repeat2 className="h-5 w-5" strokeWidth={1.5} />
          <span className="text-sm font-medium hidden sm:inline">Volver a publicar</span>
        </Button>
        
        {/* Send button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-11 sm:h-10 hover:bg-muted/50 gap-2 text-muted-foreground"
          onClick={onSend}
        >
          <Send className="h-5 w-5" strokeWidth={1.5} />
          <span className="text-sm font-medium hidden sm:inline">Enviar</span>
        </Button>
      </div>
    </div>
  );
}
