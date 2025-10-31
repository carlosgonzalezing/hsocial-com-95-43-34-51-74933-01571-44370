import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { ReactionType } from "@/types/database/social.types";
import { reactionIcons } from "./ReactionIcons";
import { ReactionMenu } from "./ReactionMenu";
import { useLongPress } from "./hooks/use-long-press";

interface HoverReactionButtonProps {
  postId: string;
  userReaction: ReactionType | null;
  onReactionClick: (type: ReactionType) => void;
  postType?: string;
  isSubmitting?: boolean;
}

const availableReactions: Array<{
  type: ReactionType;
  emoji: string;
  label: string;
}> = [
  { type: 'love', emoji: '❤️', label: 'Me gusta' },
  { type: 'awesome', emoji: '💡', label: 'Idea brillante' },
  { type: 'incredible', emoji: '🚀', label: 'Increíble' },
];

export function HoverReactionButton({
  postId, 
  userReaction, 
  onReactionClick,
  postType,
  isSubmitting = false
}: HoverReactionButtonProps) {
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
        onReactionClick(reaction);
      }
      setShowReactions(false);
    }
  });

  // Determinar qué reacción mostrar basado en la reacción del usuario
  const primaryReactionType: ReactionType = userReaction || "love";
  const reactionData = reactionIcons[primaryReactionType];
  
  // Click en el botón principal
  const handleButtonClick = useCallback(() => {
    if (userReaction) {
      // Si ya reaccionó, cambiar/quitar la reacción
      setAnimatingReaction(primaryReactionType);
      setTimeout(() => setAnimatingReaction(null), 600);
      onReactionClick(primaryReactionType);
    } else {
      // Si no ha reaccionado, mostrar menú
      setShowReactions(true);
    }
  }, [onReactionClick, primaryReactionType, userReaction, setShowReactions]);

  // Determinar si el usuario ha reaccionado
  const hasReacted = userReaction !== null;
  
  // Obtener el ícono de la reacción
  const CurrentIcon = reactionData.icon;
  const currentColor = hasReacted ? reactionData.color : '';
  const currentEmoji = hasReacted ? reactionData.emoji : null;

  const handleReactionSelected = useCallback((type: ReactionType) => {
    setAnimatingReaction(type);
    setTimeout(() => setAnimatingReaction(null), 600);
    onReactionClick(type);
    setShowReactions(false);
  }, [onReactionClick, setShowReactions]);

  return (
    <div className="relative">
      {/* Menú de reacciones flotante */}
      {showReactions && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 ml-[-16rem]"> 
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
        className={`flex items-center px-3 py-2 transition-all duration-200 ${
          hasReacted ? `${currentColor} bg-red-50 border border-red-200` : 'hover:bg-muted/50 border border-transparent'
        } ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
        onClick={handleButtonClick}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        disabled={isSubmitting}
      >
        {currentEmoji ? (
          <span className={`mr-2 text-xl transition-transform duration-200 ${
            hasReacted ? `scale-110 ${reactionData.animationClass}` : ''
          } ${animatingReaction === primaryReactionType ? reactionData.animationClass : ''}`}>
            {currentEmoji}
          </span>
        ) : (
          <CurrentIcon 
            className={`h-5 w-5 mr-2 transition-transform duration-200 ${
              hasReacted ? `${currentColor} fill-current scale-110 ${reactionData.animationClass}` : ''
            } ${animatingReaction === primaryReactionType ? reactionData.animationClass : ''}`}
            strokeWidth={1.5}
          />
        )}
        <span className={`text-sm font-medium ${hasReacted ? currentColor : ''}`}>
          {hasReacted ? reactionData.label : "Reaccionar"}
        </span>
      </Button>
    </div>
  );
}