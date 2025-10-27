import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ShareOptions } from "./ShareOptions";
import { MessageCircle, Share2, Heart, Send } from "lucide-react";
import { Post } from "@/types/post";
import { ReactionType } from "@/types/database/social.types";
import { SavePostButton } from "./SavePostButton";
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
  // Handler for reaction clicks
  const handleReactionClick = (type: ReactionType) => {
    if (onReaction) {
      onReaction(postId, type);
    } else if (handleReaction) {
      handleReaction(type);
    }
  };

  // Calculate comments count
  const commentsCount = post?.comments_count || 0;

  const [animatingReaction, setAnimatingReaction] = useState<ReactionType | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Long press hook para mostrar menú de reacciones
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
        setTimeout(() => setAnimatingReaction(null), 600);
      }
      setShowReactions(false);
    }
  });

  // Click en el botón de reacción
  const handleReactionButtonClick = useCallback(() => {
    if (!showReactions) {
      const reactionType = userReaction || 'love';
      handleReactionClick(reactionType);
      setAnimatingReaction(reactionType);
      setTimeout(() => setAnimatingReaction(null), 600);
    }
  }, [userReaction, handleReactionClick, showReactions]);

  const handleReactionSelected = useCallback((type: ReactionType) => {
    setAnimatingReaction(type);
    setTimeout(() => setAnimatingReaction(null), 600);
    handleReactionClick(type);
    setShowReactions(false);
  }, [handleReactionClick, setShowReactions]);

  // Determinar qué icono mostrar
  const hasReacted = userReaction !== null;
  const reactionData = hasReacted ? reactionIcons[userReaction] : null;

  // Instagram-style layout (sin texto, solo iconos)
  return (
    <div className="px-4 py-3 border-t border-border/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Reaccionar - Instagram style con long press */}
          <div className="relative">
            {/* Menú de reacciones flotante */}
            {showReactions && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 ml-[-10rem] sm:ml-0">
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
              className="p-0 h-auto hover:bg-transparent"
              onClick={handleReactionButtonClick}
              onPointerDown={handlePressStart}
              onPointerUp={handlePressEnd}
              onPointerLeave={handlePressEnd}
            >
              {hasReacted && reactionData ? (
                <span className={`text-2xl leading-none ${animatingReaction === userReaction ? reactionData.animationClass : ''}`}>
                  {reactionData.emoji}
                </span>
              ) : (
                <Heart 
                  className={`h-7 w-7 transition-all ${animatingReaction === 'love' ? 'scale-110' : ''}`}
                  strokeWidth={1.5}
                />
              )}
            </Button>
          </div>
          
          {/* Comentar */}
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={onComment}
          >
            <MessageCircle 
              className={`h-7 w-7 ${commentsExpanded ? 'fill-current' : ''}`}
              strokeWidth={1.5}
            />
          </Button>
          
          {/* Compartir */}
          {post ? (
            <ShareOptions post={post}>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto hover:bg-transparent"
              >
                <Send className="h-6 w-6" strokeWidth={1.5} />
              </Button>
            </ShareOptions>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto hover:bg-transparent"
              onClick={onShare}
            >
              <Send className="h-6 w-6" strokeWidth={1.5} />
            </Button>
          )}
        </div>

        {/* Guardar - Alineado a la derecha */}
        <SavePostButton postId={postId} />
      </div>
      
    </div>
  );
}
