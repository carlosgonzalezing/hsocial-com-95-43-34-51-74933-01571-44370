
import { Post } from "@/types/post";
import { useCommentMutations } from "./use-comment-mutations";
import { ReactionType } from "@/types/database/social.types";
import {
  usePostState,
  usePostAuthor,
  usePostComments,
  usePostReactions,
  usePostActions,
  useCommentSubmit
} from "./posts";

export function usePost(post: Post, hideComments = false) {
  // Core state and functions
  const {
    showComments,
    newComment,
    commentImage,
    replyTo,
    isCurrentUserAuthor,
    setIsCurrentUserAuthor,
    setNewComment,
    setCommentImage,
    setReplyTo,
    toggleComments,
    handleCancelReply
  } = usePostState(post, hideComments);
  
  // Check if current user is post author
  // Use either user_id or author_id
  usePostAuthor(post.user_id || post.author_id, setIsCurrentUserAuthor);
  
  // Comments functionality
  const {
    comments,
    handleCommentReaction,
    handleReply
  } = usePostComments(post.id, showComments, setReplyTo, setNewComment);
  
  // Post reactions
  const { onReaction } = usePostReactions(post.id);
  
  // Post actions (delete)
  const { onDeletePost } = usePostActions(post.id);
  
  // Comment submission
  const { handleSubmitComment: submitComment } = useCommentSubmit(
    post.id,
    setNewComment,
    setCommentImage,
    setReplyTo
  );
  
  // Delete comment functionality
  const { deleteComment } = useCommentMutations(post.id);
  
  // Wrapper function to provide the necessary parameters to submitComment
  const handleSubmitComment = () => {
    submitComment(newComment, commentImage, replyTo);
  };
  
  return {
    showComments,
    comments,
    newComment,
    commentImage,
    setCommentImage,
    replyTo,
    isCurrentUserAuthor,
    onDeletePost,
    onReaction,
    toggleComments,
    handleCommentReaction,
    handleReply,
    handleSubmitComment,
    handleCancelReply,
    handleDeleteComment: deleteComment,
    setNewComment
  };
}
