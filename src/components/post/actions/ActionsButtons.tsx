// Archivo: src/components/ActionsButtons.tsx

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ShareOptions } from "./ShareOptions";
import { MessageCircle, Heart, Send } from "lucide-react";
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
  
  const reactionEmojis: Record<ReactionType, string> = {
    love: '❤️',
    awesome: '💡',
    incredible: '🚀',
  };
  
  // Handler para la selección final de la reacción
  const handleReactionClick = (type: ReactionType) => {
    if (onReaction) {
      onReaction(postId, type);
    } else if (handleReaction) {
      handleReaction(type);
    }
  };

  const [animatingReaction, setAnimatingReaction] = useState<ReactionType | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Hook de pulsación larga para mostrar el menú
  const { 
    showReactions, 
    activeReaction, 
    setActiveReaction, 
    setShowReactions, 
    handlePressStart, 
    handlePressEnd 
  } = useLongPress({
    onPressEnd: (reaction) => {
      // Si reaction es null, es un clic rápido.
      // Si es una ReactionType, es una selección final del menú.
      if (reaction) {
        handleReactionClick(reaction);
        setAnimatingReaction(reaction);
      } else {
        // Clic rápido: usa la reacción actual, o 'love' por defecto
        const defaultReaction = userReaction || 'love';
        handleReactionClick(defaultReaction);
        setAnimatingReaction(defaultReaction);
      }
      setTimeout(() => setAnimatingReaction(null), 600);
      setShowReactions(false);
    }
  });

  // Click en el botón de reacción (solo se usa si no se detecta long press)
  const handleReactionButtonClick = useCallback(() => {
    // La lógica de clic rápido se mueve a onPressEnd(null) en useLongPress
    // Esto asegura que la lógica de un solo clic y long press no se mezclen.
    // Aquí podemos dejarlo vacío si useLongPress maneja todo, o usarlo para manejar la desreacción
    if (!showReactions) {
        // Si el menú no está visible (es un clic rápido)
        const reactionType = userReaction || 'love';
        
        // Siempre reaccionar con el tipo actual o por defecto
        handleReactionClick(reactionType);
        setAnimatingReaction(reactionType);
        setTimeout(() => setAnimatingReaction(null), 600);
    }
  }, [userReaction, handleReactionClick, showReactions]);

  // Función que llama ReactionMenu al seleccionar un emoji
  const handleReactionSelected = useCallback((type: ReactionType) => {
    setAnimatingReaction(type);
    setTimeout(() => setAnimatingReaction(null), 600);
    handleReactionClick(type);
    setShowReactions(false);
  }, [handleReactionClick, setShowReactions]);

  // Determinar qué icono mostrar en el botón principal
  const hasReacted = userReaction !== null;
  const reactionData = hasReacted ? reactionIcons[userReaction] : null;

  return (
    <div className="px-4 py-2 border-t border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          
          {/* Reaccionar - Implementación con Long Press */}
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
              className="p-0 h-auto hover:bg-transparent gap-2 text-muted-foreground hover:text-foreground"
              // Usamos los handlers de puntero para controlar el Long Press
              // El onClick se usa como fallback o para manejar la desreacción.
              onClick={handleReactionButtonClick} 
              onPointerDown={handlePressStart}
              onPointerUp={handlePressEnd}
              onPointerLeave={handlePressEnd}
            >
              {/* Icono Principal */}
              {hasReacted && reactionData ? (
                <span className={`text-2xl leading-none ${animatingReaction === userReaction ? reactionData.animationClass : ''}`}>
                  {reactionData.emoji}
                </span>
              ) : (
                <Heart 
                  className={`h-7 w-7 transition-all ${userReaction === 'love' || animatingReaction === 'love' ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                  strokeWidth={1.5}
                />
              )}
            </Button>
          </div>
          
          {/* Comentar */}
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent gap-2 text-muted-foreground hover:text-foreground"
            onClick={onComment}
          >
            <MessageCircle 
              className={`h-7 w-7 ${commentsExpanded ? 'fill-current text-foreground' : ''}`}
              strokeWidth={1.5}
            />
          </Button>
          
          {/* Compartir */}
          {post ? (
            <ShareOptions post={post}>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto hover:bg-transparent gap-2 text-muted-foreground hover:text-foreground"
              >
                <Send className="h-6 w-6" strokeWidth={1.5} />
              </Button>
            </ShareOptions>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto hover:bg-transparent gap-2 text-muted-foreground hover:text-foreground"
              onClick={onShare}
            >
              <Send className="h-6 w-6" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}