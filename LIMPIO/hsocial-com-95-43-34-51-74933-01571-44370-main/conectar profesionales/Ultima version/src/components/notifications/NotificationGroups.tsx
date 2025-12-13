
import { NotificationItem } from "./NotificationItem";
import { NotificationWithSender } from "@/types/notifications";
import { useNavigate } from "react-router-dom";
import { NotificationGroupHeader } from "./NotificationGroupHeader";

interface NotificationGroupsProps {
  groupedNotifications: {
    today: NotificationWithSender[];
    yesterday: NotificationWithSender[];
    older: NotificationWithSender[];
  };
  handleFriendRequest: (notificationId: string, senderId: string, accept: boolean) => void;
  markAsRead: (notificationIds?: string[]) => void;
  removeNotification: (notificationId: string) => void;
  setOpen: (open: boolean) => void;
}

export function NotificationGroups({ 
  groupedNotifications, 
  handleFriendRequest, 
  markAsRead,
  removeNotification,
  setOpen 
}: NotificationGroupsProps) {
  const navigate = useNavigate();

  const handleNotificationClick = (notification: NotificationWithSender) => {
    // Close dropdown first to prevent stuck UI
    setOpen(false);

    // Slight delay to ensure dropdown is closed before navigation
    setTimeout(() => {
      if (notification.type === 'friend_request') {
        navigate(`/profile/${notification.sender.id}`);
      } else if (notification.post_id) {
        navigate(`/post/${notification.post_id}`);
      }
      
      if (!notification.read) {
        markAsRead([notification.id]);
      }
    }, 100);
  };

  return (
    <>
      {groupedNotifications.today.length > 0 && (
        <>
          <NotificationGroupHeader title="Hoy" />
          {groupedNotifications.today.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onHandleFriendRequest={handleFriendRequest}
              onClick={() => handleNotificationClick(notification)}
              onMarkAsRead={() => markAsRead([notification.id])}
              onRemove={() => removeNotification(notification.id)}
              compact={true}
            />
          ))}
        </>
      )}
      
      {groupedNotifications.yesterday.length > 0 && (
        <>
          <NotificationGroupHeader title="Ayer" />
          {groupedNotifications.yesterday.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onHandleFriendRequest={handleFriendRequest}
              onClick={() => handleNotificationClick(notification)}
              onMarkAsRead={() => markAsRead([notification.id])}
              onRemove={() => removeNotification(notification.id)}
              compact={true}
            />
          ))}
        </>
      )}
      
      {groupedNotifications.older.length > 0 && (
        <>
          <NotificationGroupHeader title="Anteriores" />
          {groupedNotifications.older.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onHandleFriendRequest={handleFriendRequest}
              onClick={() => handleNotificationClick(notification)}
              onMarkAsRead={() => markAsRead([notification.id])}
              onRemove={() => removeNotification(notification.id)}
              compact={true}
            />
          ))}
        </>
      )}
    </>
  );
}
