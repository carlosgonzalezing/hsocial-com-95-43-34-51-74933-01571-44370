
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface CommentsCountProps {
  count: number;
  onClick: () => void;
  isExpanded?: boolean;
}

export function CommentsCount({ count, onClick, isExpanded = false }: CommentsCountProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-auto p-0 flex items-center gap-1 ${isExpanded ? 'text-primary font-medium' : ''}`}
      onClick={onClick}
    >
      <MessageSquare className={`h-4 w-4 ${isExpanded ? 'text-primary' : ''}`} />
      <span>{count} {count === 1 ? "comentario" : "comentarios"}</span>
    </Button>
  );
}
