import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useState } from "react";
import { ReactionMenu } from "../reactions/ReactionMenu";
import { type ReactionType } from "../reactions/ReactionIcons";
import { useLongPress } from "../reactions/hooks/use-long-press";

interface ReactionButtonProps {
  onReaction: (type: ReactionType) => void;
  reactionCount: number;
  userReaction?: ReactionType | null;
}

export function ReactionButton({ 
  onReaction, 
  reactionCount, 
  userReaction 
}: ReactionButtonProps) {
  const [animatingReaction, setAnimatingReaction] = useState<ReactionType | null>(null);

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
        handleReactionSelected(reaction);
      }
      setShowReactions(false);
    }
  });

  const handleReactionSelected = (type: ReactionType) => {
    setAnimatingReaction(type);
    setTimeout(() => setAnimatingReaction(null), 600);
    onReaction(type);
  };

  const handleClick = () => {
    if (!showReactions) {
      // Click normal: reacción de amor por defecto
      handleReactionSelected('love');
    }
  };

  const userHasReacted = !!userReaction;

  return (
    <div className="relative flex items-center">
      {/* Menú de reacciones flotante */}
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <ReactionMenu
            show={showReactions}
            activeReaction={activeReaction}
            setActiveReaction={setActiveReaction}
            onReactionSelected={handleReactionSelected}
            onPointerLeave={() => {
              setShowReactions(false);
              setActiveReaction(null);
            }}
          />
        </div>
      )}

      <Button 
        variant="ghost" 
        size="sm" 
        className={`flex items-center gap-2 ${userHasReacted ? 'text-red-500' : ''}`}
        onClick={handleClick}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
      >
        <Heart 
          className={`h-6 w-6 transition-transform duration-200 ${
            userHasReacted ? 'fill-red-500 text-red-500 scale-110' : ''
          } ${animatingReaction ? 'reaction-love' : ''}`} 
        />
        <span className="text-sm">Reaccionar</span>
      </Button>
    </div>
  );
}
