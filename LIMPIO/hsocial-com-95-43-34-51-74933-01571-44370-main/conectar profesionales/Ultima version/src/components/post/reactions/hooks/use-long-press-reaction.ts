
import { useState, useCallback } from "react";
import { type ReactionType } from "@/types/database/social.types";
import { useReactionAuth } from "./use-reaction-auth";
import { useReactionHandler } from "./use-reaction-handler";
import { useLongPress } from "./use-long-press";


interface UseLongPressReactionProps {
  userReaction?: ReactionType;
  onReactionClick: (type: ReactionType) => void;
  postId: string;
  longPressThreshold?: number;
}

export function useLongPressReaction({
  userReaction,
  onReactionClick,
  postId,
  longPressThreshold = 500,
}: UseLongPressReactionProps) {
  const { authError, isAuthenticated, validateSession } = useReactionAuth();
  
  // Loading state for auth check
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  
  // Align to current useReactionHandler API (returns: { userReaction, isLoading, handleReaction })
  const { isLoading, handleReaction } = useReactionHandler({
    postId,
    initialReaction: userReaction || null
  });

  // Check authentication using shared auth hook
  const checkAuthentication = useCallback(async () => {
    setIsCheckingAuth(true);
    try {
      const user = await validateSession();
      return !!user;
    } catch (error) {
      console.error("Error checking auth:", error);
      return false;
    } finally {
      setIsCheckingAuth(false);
    }
  }, [validateSession]);

  // Local UI state for the long press menu
  const [activeReactionState, setActiveReactionState] = useState<ReactionType | null>(null);
  const [showReactionsState, setShowReactionsState] = useState(false);

  // When a reaction is selected via the long-press menu
  const handleReactionComplete = useCallback(async (selectedReaction: ReactionType | null) => {
    if (selectedReaction) {
      const isLoggedIn = await checkAuthentication();
      if (isLoggedIn) {
        await handleReaction(selectedReaction);
        onReactionClick(selectedReaction);
      }
    }
    setShowReactionsState(false);
    setActiveReactionState(null);
  }, [checkAuthentication, handleReaction, onReactionClick]);

  // Use the long press utility
  const {
    showReactions,
    activeReaction,
    setActiveReaction,
    setShowReactions,
    handlePressStart,
    handlePressEnd
  } = useLongPress({
    longPressThreshold,
    onPressEnd: handleReactionComplete
  });

  // Simple click on the main reaction button (toggle or apply current)
  const handleButtonClick = useCallback(async () => {
    if (userReaction) {
      const isLoggedIn = await checkAuthentication();
      if (isLoggedIn) {
        await handleReaction(userReaction);
        onReactionClick(userReaction);
      }
    }
  }, [checkAuthentication, handleReaction, onReactionClick, userReaction]);

  return {
    isSubmitting: isLoading || isCheckingAuth,
    showReactions,
    activeReaction,
    setActiveReaction,
    setShowReactions,
    handlePressStart,
    handlePressEnd,
    handleButtonClick,
    handleReactionClick: (type: ReactionType) => handleReaction(type),
    authError,
    isAuthenticated,
    checkAuthentication
  };
}

