import { NotificationType } from "@/types/notifications";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface NotificationContentProps {
  type: NotificationType;
  senderName: string;
  message?: string;
  compact?: boolean;
  notificationId: string;
  senderId: string;
  onHandleFriendRequest?: (notificationId: string, senderId: string, accept: boolean) => void;
}

export const NotificationContent = ({
  type,
  senderName,
  message,
  notificationId,
  senderId,
  onHandleFriendRequest,
  compact = false
}: NotificationContentProps) => {
  if (message) {
    return (
      <span>
        <span className="font-medium">{senderName}</span> {message}
      </span>
    );
  }

  switch (type) {
    case 'friend_request':
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Tienes una sugerencia de amistad nueva: <span className="font-medium">{senderName}</span>
          </span>
          {onHandleFriendRequest && !compact && (
            <div className="flex items-center ml-auto">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onHandleFriendRequest(notificationId, senderId, true);
                }}
                className="h-8 px-2"
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onHandleFriendRequest(notificationId, senderId, false);
                }}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
      );
    case 'mention':
      return (
        <span>
          <span className="font-medium">{senderName}</span> te ha mencionado en una publicación
        </span>
      );
    case 'post_like':
      return (
        <span>
          <span className="font-medium">{senderName}</span> ha reaccionado a tu publicación
        </span>
      );
    case 'post_comment':
      return (
        <span>
          <span className="font-medium">{senderName}</span> ha comentado en tu publicación
        </span>
      );
    case 'comment_reply':
      return (
        <span>
          <span className="font-medium">{senderName}</span> ha respondido a tu comentario
        </span>
      );
    case 'message':
      return (
        <span>
          <span className="font-medium">{senderName}</span> te envió un mensaje
        </span>
      );
    case 'new_post':
      return (
        <span>
          <span className="font-medium">{senderName}</span> ha realizado una nueva publicación
        </span>
      );
    case 'friend_accepted':
      return (
        <span>
          <span className="font-medium">{senderName}</span> aceptó tu solicitud de amistad
        </span>
      );
    case 'profile_heart_received':
      return (
        <span>
          <span className="font-medium">{senderName}</span> {message}
        </span>
      );
    case 'engagement_hearts_earned':
      return (
        <span className="text-red-500 dark:text-red-400">
          ❤️ {message}
        </span>
      );
    case 'hearts_daily_summary':
      return (
        <span className="text-red-500 dark:text-red-400">
          ❤️ {message}
        </span>
      );
    default:
      return null;
  }
};
