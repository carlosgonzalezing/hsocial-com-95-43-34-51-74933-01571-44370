
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentButtonProps {
  onToggleComments: () => void;
  isExpanded?: boolean;
  className?: string;
}

export function CommentButton({ onToggleComments, isExpanded = false, className = "" }: CommentButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex-1 post-action-button flex items-center gap-2 ${isExpanded ? 'text-primary dark:text-primary' : 'text-foreground dark:text-white'} ${className}`}
      onClick={onToggleComments}
    >
      <MessageSquare className={`h-4 w-4 ${isExpanded ? 'text-primary dark:text-primary' : 'text-foreground dark:text-white'}`} />
      Comentar
    </Button>
  );
}
