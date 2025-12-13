
import { useReactionMutations } from "./use-reaction-mutations";
import { usePostDeleteMutation } from "./use-post-delete-mutation";
import { useCommentMutations } from "./use-comment-mutations";
import { usePollVoteMutation } from "./use-poll-vote-mutation";
import { useIdeaJoinMutation } from "./idea-join";
import type { ReactionType } from "@/types/database/social.types";
import type { CommentData, CommentReactionParams } from "./types";

export function usePostMutations(postId: string) {
  const { handleReaction, toggleCommentReaction } = useReactionMutations(postId);
  const { handleDeletePost } = usePostDeleteMutation(postId);
  const { submitComment } = useCommentMutations(postId);
  const { submitVote } = usePollVoteMutation(postId);

  return {
    handleReaction,
    handleDeletePost,
    toggleCommentReaction,
    submitComment,
    submitVote
  };
}

// Use 'export type' when re-exporting types with isolatedModules enabled
export type { CommentData, ReactionType, CommentReactionParams };
export { useIdeaJoinMutation };
