
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ReplyBadgeProps {
  replyTo: { id: string; username: string } | null;
  onCancelReply: () => void;
}

export function ReplyBadge({ replyTo, onCancelReply }: ReplyBadgeProps) {
  if (!replyTo) return null;
  
  return (
    <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md text-sm">
      <span className="text-muted-foreground">
        Respondiendo a <span className="font-medium text-foreground">@{replyTo.username}</span>
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full"
        onClick={onCancelReply}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
