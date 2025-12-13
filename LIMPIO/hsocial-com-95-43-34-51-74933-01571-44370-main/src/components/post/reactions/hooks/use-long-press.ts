
import { useState, useRef, useCallback, useEffect } from "react";
import { type ReactionType } from "../ReactionIcons";

interface UseLongPressProps {
  longPressThreshold?: number;
  onPressEnd?: (reaction: ReactionType | null) => void;
}

export function useLongPress({
  longPressThreshold = 500,
  onPressEnd
}: UseLongPressProps = {}) {
  const [showReactions, setShowReactions] = useState(false);
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  // Show reactions immediately on click
  const handlePressStart = useCallback(() => {
    setShowReactions(true);
  }, []);

  const handlePressEnd = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    // If there's an active reaction and the reactions menu is visible,
    // trigger the callback when the user lifts their finger/pointer
    if (activeReaction && showReactions && onPressEnd) {
      onPressEnd(activeReaction);
    }
  }, [activeReaction, showReactions, onPressEnd]);

  // Clean up timer if component unmounts while timer is active
  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  return {
    showReactions,
    activeReaction,
    setActiveReaction,
    setShowReactions,
    handlePressStart,
    handlePressEnd
  };
}
