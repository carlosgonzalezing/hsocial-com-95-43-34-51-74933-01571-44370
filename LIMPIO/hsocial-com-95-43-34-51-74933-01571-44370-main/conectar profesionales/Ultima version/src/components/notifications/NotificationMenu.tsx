
import { Button } from "@/components/ui/button";
import { MoreVertical, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationMenuProps {
  isRead: boolean;
  onMarkAsRead: () => void;
  compact?: boolean;
}

export const NotificationMenu = ({
  isRead,
  onMarkAsRead,
  compact = false
}: NotificationMenuProps) => {
  if (!onMarkAsRead) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={compact ? "h-7 w-7 rounded-full" : "h-8 w-8"}
        >
          {compact ? (
            <MoreHorizontal className="h-4 w-4" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onMarkAsRead();
        }}>
          {isRead ? 'Marcar como no leída' : 'Marcar como leída'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
