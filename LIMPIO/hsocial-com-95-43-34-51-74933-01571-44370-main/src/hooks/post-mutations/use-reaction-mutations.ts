
import { useAuthState } from "./reactions/use-auth-state";
import { useAuthCheck } from "./reactions/use-auth-check";
import { useCommentReaction } from "./reactions/use-comment-reaction";
import { usePostReactions } from "@/hooks/posts/use-post-reactions";

export function useReactionMutations(postId: string) {
  const { sessionChecked, hasValidSession, setHasValidSession } = useAuthState();
  const { checkAuth } = useAuthCheck(sessionChecked, hasValidSession, setHasValidSession);
  const { onReaction } = usePostReactions(postId);
  const { toggleCommentReaction } = useCommentReaction(postId, checkAuth);
  
  return {
    handleReaction: onReaction,
    toggleCommentReaction,
    isAuthenticated: hasValidSession,
    checkAuth
  };
}
