
import { useRef, useEffect } from "react";

export function useCommentTextarea({
  replyTo,
  mentionListVisible,
  mentionUsers,
  mentionIndex,
  setMentionIndex,
  newComment,
  onNewCommentChange,
  insertMention,
  setMentionListVisible
}: {
  replyTo: { id: string; username: string } | null;
  mentionListVisible: boolean;
  mentionUsers: any[];
  mentionIndex: number;
  setMentionIndex: (index: number) => void;
  newComment: string;
  onNewCommentChange: (value: string) => void;
  insertMention: (text: string, user: any) => string;
  setMentionListVisible: (visible: boolean) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus the textarea when replying to someone
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit comment when pressing Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey && !mentionListVisible) {
      e.preventDefault();
      return true; // Signal to parent that submission should occur
    }
    
    // Handle mention selection with keyboard navigation
    if (mentionListVisible && mentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newIndex = (mentionIndex + 1) % mentionUsers.length;
        setMentionIndex(newIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = (mentionIndex <= 0) ? mentionUsers.length - 1 : mentionIndex - 1;
        setMentionIndex(newIndex);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (mentionIndex >= 0 && mentionIndex < mentionUsers.length) {
          const newText = insertMention(newComment, mentionUsers[mentionIndex]);
          onNewCommentChange(newText);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMentionListVisible(false);
      }
    }
    return false; // No submission
  };

  return {
    textareaRef,
    handleKeyDown
  };
}
