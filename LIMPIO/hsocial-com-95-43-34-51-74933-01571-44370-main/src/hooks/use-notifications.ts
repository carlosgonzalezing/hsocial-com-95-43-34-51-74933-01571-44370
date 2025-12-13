
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { NotificationWithSender, NotificationType } from "@/types/notifications";
import { fetchNotifications } from "@/lib/notifications/fetch-notifications";
import { 
  handleFriendRequest as handleFriendRequestAction,
  markNotificationsAsRead,
  clearAllNotifications as clearAllNotificationsAction,
  removeNotification as removeNotificationAction
} from "@/lib/notifications/notification-actions";
import { subscribeToNotifications } from "@/lib/notifications/subscribe-notifications";
import { formatNotificationMessage } from "@/lib/notifications/format-message";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationWithSender[]>([]);
  const { toast } = useToast();

  const loadNotifications = async () => {
    const notificationsData = await fetchNotifications();
    setNotifications(notificationsData);
  };

  useEffect(() => {
    loadNotifications();

    const unsubscribe = subscribeToNotifications(
      (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
      },
      (title, description) => {
        toast({
          title,
          description,
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleFriendRequest = async (notificationId: string, senderId: string, accept: boolean) => {
    try {
      const success = await handleFriendRequestAction(notificationId, senderId, accept);
      
      if (success) {
        toast({
          title: accept ? "Solicitud aceptada" : "Solicitud rechazada",
          description: accept ? "Ahora son amigos" : "Has rechazado la solicitud de amistad",
        });
        
        loadNotifications();
      } else {
        throw new Error("No se pudo procesar la solicitud");
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la solicitud",
      });
    }
  };

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      const success = await markNotificationsAsRead(notificationIds);
      
      if (success) {
        // Update the local state
        setNotifications(prev => 
          prev.map(notification => 
            notificationIds 
              ? notificationIds.includes(notification.id) 
                ? { ...notification, read: true } 
                : notification
              : { ...notification, read: true }
          )
        );
      } else {
        throw new Error("No se pudieron marcar las notificaciones como leídas");
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron marcar las notificaciones como leídas",
      });
    }
  };

  const removeNotification = async (notificationId: string) => {
    try {
      const success = await removeNotificationAction(notificationId);
      
      if (success) {
        // Remove from local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        toast({
          title: "Notificación eliminada",
          description: "La notificación ha sido eliminada",
        });
      } else {
        throw new Error("No se pudo eliminar la notificación");
      }
    } catch (error) {
      console.error('Error removing notification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la notificación",
      });
    }
  };

  const clearAllNotifications = async () => {
    try {
      const success = await clearAllNotificationsAction();
      
      if (success) {
        setNotifications([]);
        
        toast({
          title: "Notificaciones eliminadas",
          description: "Todas las notificaciones han sido eliminadas",
        });
      } else {
        throw new Error("No se pudieron eliminar las notificaciones");
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron eliminar las notificaciones",
      });
    }
  };

  return {
    notifications,
    handleFriendRequest,
    markAsRead,
    removeNotification,
    clearAllNotifications
  };
};
