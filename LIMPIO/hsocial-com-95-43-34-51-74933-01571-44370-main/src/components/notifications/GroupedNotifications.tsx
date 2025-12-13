import { NotificationWithSender } from "@/types/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface GroupedNotificationsProps {
  notifications: NotificationWithSender[];
  onClick: (notification: NotificationWithSender) => void;
}

export function GroupedNotifications({ notifications, onClick }: GroupedNotificationsProps) {
  // Group notifications by type and context
  const grouped = notifications.reduce((acc, notification) => {
    const key = `${notification.type}-${notification.post_id || notification.comment_id || ""}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(notification);
    return acc;
  }, {} as Record<string, NotificationWithSender[]>);

  return (
    <div className="space-y-2">
      {Object.values(grouped).map((group) => {
        const shouldGroup = group.length > 1 && ["post_like", "post_comment", "comment_reply"].includes(group[0].type);

        if (shouldGroup) {
          return (
            <GroupedNotificationItem
              key={group[0].id}
              notifications={group}
              onClick={() => onClick(group[0])}
            />
          );
        }

        return group.map((notification) => (
          <SingleNotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => onClick(notification)}
          />
        ));
      })}
    </div>
  );
}

function GroupedNotificationItem({
  notifications,
  onClick,
}: {
  notifications: NotificationWithSender[];
  onClick: () => void;
}) {
  const firstNotification = notifications[0];
  const count = notifications.length;
  const otherUsers = notifications.slice(0, 3).map((n) => n.sender);

  return (
    <button
      onClick={onClick}
      className="w-full p-3 hover:bg-muted/50 transition-colors text-left flex items-start gap-3"
    >
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 3).map((user, i) => (
          <Avatar key={i} className="w-10 h-10 border-2 border-background">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">
            {otherUsers[0].username}
            {count > 1 && `, ${otherUsers[1]?.username || "otro"}`}
            {count > 2 && ` y ${count - 2} más`}
          </span>{" "}
          {getGroupedMessage(firstNotification.type)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(firstNotification.created_at), {
            addSuffix: true,
            locale: es,
          })}
        </p>
      </div>
    </button>
  );
}

function SingleNotificationItem({
  notification,
  onClick,
}: {
  notification: NotificationWithSender;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 hover:bg-muted/50 transition-colors text-left flex items-start gap-3"
    >
      <Avatar className="w-10 h-10">
        <AvatarImage src={notification.sender.avatar_url || undefined} />
        <AvatarFallback>
          {notification.sender.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">{notification.sender.username}</span>{" "}
          {getMessage(notification.type)}
        </p>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: es,
          })}
        </p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </button>
  );
}

function getGroupedMessage(type: string) {
  switch (type) {
    case "post_like":
      return "reaccionaron a tu publicación";
    case "post_comment":
      return "comentaron tu publicación";
    case "comment_reply":
      return "respondieron a tu comentario";
    default:
      return "interactuaron con tu contenido";
  }
}

function getMessage(type: string) {
  switch (type) {
    case "friend_request":
      return "te envió una solicitud de amistad";
    case "friend_accepted":
      return "aceptó tu solicitud de amistad";
    case "post_like":
      return "reaccionó a tu publicación";
    case "post_comment":
      return "comentó tu publicación";
    case "comment_reply":
      return "respondió a tu comentario";
    case "mention":
      return "te mencionó";
    case "story_reaction":
      return "reaccionó a tu historia";
    case "story_reply":
      return "respondió a tu historia";
    default:
      return "tiene una nueva actividad";
  }
}
