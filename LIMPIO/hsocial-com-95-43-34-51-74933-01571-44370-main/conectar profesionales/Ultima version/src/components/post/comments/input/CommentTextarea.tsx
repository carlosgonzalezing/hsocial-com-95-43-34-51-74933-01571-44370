
import { Textarea } from "@/components/ui/textarea";
import { forwardRef } from "react";

interface CommentTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}

export const CommentTextarea = forwardRef<HTMLTextAreaElement, CommentTextareaProps>(
  ({ value, onChange, onKeyDown, placeholder }, ref) => {
    return (
      <Textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="resize-none min-h-[80px]"
        id="comment-textarea"
        name="comment-textarea"
      />
    );
  }
);

CommentTextarea.displayName = "CommentTextarea";
