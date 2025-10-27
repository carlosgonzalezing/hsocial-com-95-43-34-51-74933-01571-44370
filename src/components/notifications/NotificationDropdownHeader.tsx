import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface NotificationDropdownHeaderProps {
  hasUnread: boolean;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

export function NotificationDropdownHeader({ 
  hasUnread, 
  onMarkAllAsRead,
  onClose
}: NotificationDropdownHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b p-3">
      <h3 className="font-semibold">Notificaciones</h3>
      <div className="flex items-center gap-2">
        {hasUnread && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMarkAllAsRead} 
            className="h-8 text-xs"
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            <span>Marcar como leídas</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}