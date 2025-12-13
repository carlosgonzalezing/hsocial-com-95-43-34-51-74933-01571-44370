
import { useState } from "react";
import { Post } from "@/types/post";

/**
 * Hook for managing post-related state
 */
export function usePostState(post: Post, hideComments = false) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [isCurrentUserAuthor, setIsCurrentUserAuthor] = useState(false);
  
  const toggleComments = () => {
    setShowComments(prev => !prev);
  };
  
  const handleCancelReply = () => {
    setReplyTo(null);
    setNewComment("");
  };
  
  return {
    // State
    showComments,
    setShowComments,
    newComment,
    setNewComment,
    commentImage,
    setCommentImage,
    replyTo,
    setReplyTo,
    isCurrentUserAuthor,
    setIsCurrentUserAuthor,
    
    // Actions
    toggleComments,
    handleCancelReply
  };
}
