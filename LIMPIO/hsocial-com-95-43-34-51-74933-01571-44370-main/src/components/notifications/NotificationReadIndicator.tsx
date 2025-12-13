
import { NotificationIcon } from "./NotificationIcon";
import { NotificationMenu } from "./NotificationMenu";
import { NotificationType } from "@/types/notifications";

interface NotificationReadIndicatorProps {
  type: NotificationType;
  isRead: boolean;
  onMarkAsRead?: () => void;
  compact?: boolean;
}

export function NotificationReadIndicator({ 
  type, 
  isRead, 
  onMarkAsRead,
  compact = false 
}: NotificationReadIndicatorProps) {
  if (compact) {
    return onMarkAsRead ? (
      <div className="absolute right-2 top-3">
        <NotificationMenu
          isRead={isRead}
          onMarkAsRead={onMarkAsRead}
          compact={true}
        />
      </div>
    ) : null;
  }
  
  return (
    <div className="flex items-center gap-1">
      <NotificationIcon type={type} />
      {!isRead && (
        <span className="h-2 w-2 rounded-full bg-primary ml-1"></span>
      )}
      {onMarkAsRead && (
        <NotificationMenu
          isRead={isRead}
          onMarkAsRead={onMarkAsRead}
          compact={false}
        />
      )}
    </div>
  );
}
