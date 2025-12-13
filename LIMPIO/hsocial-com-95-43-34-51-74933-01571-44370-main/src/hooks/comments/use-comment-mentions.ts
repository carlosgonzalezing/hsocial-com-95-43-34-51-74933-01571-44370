
import { useRef } from "react";
import { useMentions } from "@/hooks/mentions";
import { MentionUser } from "@/hooks/mentions/types";

export function useCommentMentions(
  newComment: string,
  onNewCommentChange: (value: string) => void
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    mentionUsers,
    mentionListVisible,
    mentionPosition,
    mentionIndex,
    setMentionIndex,
    handleTextChange,
    insertMention,
    setMentionListVisible
  } = useMentions();

  // Handle cursor position changes
  const handleSelectionChange = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      handleTextChange(
        newComment, 
        textareaRef.current.selectionStart, 
        textareaRef.current
      );
    }
  };

  const setupSelectionChangeListeners = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const handler = () => handleSelectionChange(textareaRef);
      textarea.addEventListener('click', handler);
      textarea.addEventListener('keyup', handler);
      
      return () => {
        textarea.removeEventListener('click', handler);
        textarea.removeEventListener('keyup', handler);
      };
    }
    return undefined;
  };

  const handleTextAreaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    textareaRef: React.RefObject<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    onNewCommentChange(value);
    
    // Always trigger the mention handling when text changes
    if (textareaRef.current) {
      handleTextChange(value, textareaRef.current.selectionStart, textareaRef.current);
    }
  };

  const handleSelectMention = (user: MentionUser) => {
    console.log("Selecting mention:", user);
    const newText = insertMention(newComment, user);
    onNewCommentChange(newText);
  };

  const handleMentionClick = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      const textBefore = newComment.substring(0, cursorPos);
      const textAfter = newComment.substring(cursorPos);
      
      // Insert @ at cursor position
      const newValue = textBefore + '@' + textAfter;
      onNewCommentChange(newValue);
      
      // Focus and move cursor after @
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(cursorPos + 1, cursorPos + 1);
          
          // Trigger the text change handler manually
          handleTextChange(newValue, cursorPos + 1, textareaRef.current);
        }
      }, 0);
    }
  };

  return {
    containerRef,
    mentionUsers,
    mentionListVisible,
    mentionPosition,
    mentionIndex,
    setMentionIndex,
    handleTextAreaChange,
    handleSelectMention,
    handleMentionClick,
    setupSelectionChangeListeners,
    insertMention,
    setMentionListVisible
  };
}
