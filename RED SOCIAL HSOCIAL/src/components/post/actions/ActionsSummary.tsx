
import { MessageCircle } from "lucide-react";
import { ReactionSummary } from "../reactions/ReactionSummary";
import { Post } from "@/types/post";

interface ActionsSummaryProps {
  reactionsCount: number;
  commentsCount: number;
  reactionsByType: Record<string, number>;
  compact?: boolean;
  postId: string;
}

export function ActionsSummary({
  reactionsCount,
  commentsCount,
  reactionsByType,
  compact = false,
  postId,
}: ActionsSummaryProps) {
  const hasActivity = reactionsCount > 0 || commentsCount > 0;
  
  if (!hasActivity) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-4 py-2 ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground border-b`}>
      <div className="flex items-center gap-4">
        {reactionsCount > 0 && (
          <ReactionSummary reactions={reactionsByType} postId={postId} />
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {commentsCount > 0 && (
          <div className="flex items-center gap-1">
            <MessageCircle className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span>{commentsCount} {commentsCount === 1 ? 'comentario' : 'comentarios'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
