
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface CommentsToggleProps {
  onClick: () => void;
  commentCount: number;
  expanded: boolean;
}

export function CommentsToggle({ onClick, commentCount, expanded }: CommentsToggleProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="flex-1"
      onClick={onClick}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      <span>Comentarios</span>
      {commentCount > 0 && (
        <span className="ml-1 text-xs rounded-full bg-muted px-1.5 py-0.5">
          {commentCount}
        </span>
      )}
    </Button>
  );
}
