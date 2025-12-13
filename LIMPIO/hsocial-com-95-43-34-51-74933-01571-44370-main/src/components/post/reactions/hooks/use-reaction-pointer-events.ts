
import { useEffect, useCallback } from "react";
import { type ReactionType } from "../ReactionIcons";

interface UseReactionPointerEventsProps {
  showReactions: boolean;
  activeReaction: ReactionType | null;
  handlePressEnd: () => void;
  handlePointerMove: (e: PointerEvent) => void;
}

export function useReactionPointerEvents({
  showReactions,
  activeReaction,
  handlePressEnd,
  handlePointerMove
}: UseReactionPointerEventsProps) {
  // Set up and clean event listeners for pointer movement
  useEffect(() => {
    if (showReactions) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePressEnd);
    } else {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePressEnd);
    }
    
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePressEnd);
    };
  }, [showReactions, handlePointerMove, handlePressEnd]);

  // Handle leaving reaction menu area
  const handlePointerLeave = useCallback(() => {
    // Small delay to allow selecting reactions
    setTimeout(() => {
      if (activeReaction) {
        handlePressEnd();
      } else {
        // Only close menu if no reaction is selected
        // This will be handled in the hook by cleaning up the showReactions state
      }
    }, 100);
  }, [activeReaction, handlePressEnd]);

  return {
    handlePointerLeave
  };
}
