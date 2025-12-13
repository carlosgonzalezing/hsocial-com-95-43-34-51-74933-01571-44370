import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { NotificationType } from "@/types/notifications";

interface RealtimeNotificationHandlerProps {
  userId?: string;
}

export function RealtimeNotificationHandler({ userId }: RealtimeNotificationHandlerProps) {
  const { toast } = useToast();
  const {
    isEnabled,
    showMessageNotification,
    showHeartNotification,
    showReactionNotification,
    showCommentNotification,
    showFriendRequestNotification,
  } = usePushNotifications();

  useEffect(() => {
    if (!userId) return;

    console.log("🔔 Setting up realtime notification handler for user:", userId);

    // Suscribirse a notificaciones en tiempo real
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("🔔 New notification received:", payload);
          
          const notification = payload.new as any;
          
          // Obtener información del remitente
          const { data: senderData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', notification.sender_id)
            .single();

          const senderName = senderData?.username || 'Usuario desconocido';

          // Mostrar toast inmediatamente
          const toastTitle = getToastTitle(notification.type, senderName);
          const toastDescription = notification.message || getToastDescription(notification.type, senderName);
          
          toast({
            title: toastTitle,
            description: toastDescription,
          });

          // Mostrar notificación push si está habilitada
          if (isEnabled) {
            showPushNotification(notification, senderName);
          }

          // Emitir evento personalizado para actualizar el contador
          window.dispatchEvent(new CustomEvent('new-notification', {
            detail: { notification, senderName }
          }));
        }
      )
      .subscribe();

    return () => {
      console.log("🔔 Cleaning up notification handler");
      supabase.removeChannel(channel);
    };
  }, [userId, isEnabled, toast, showMessageNotification, showHeartNotification, showReactionNotification, showCommentNotification, showFriendRequestNotification]);

  const showPushNotification = (notification: any, senderName: string) => {
    switch (notification.type as NotificationType) {
      case 'profile_heart_received':
        showHeartNotification(senderName, 'profile');
        break;
        
      case 'engagement_hearts_earned':
        const heartsMatch = notification.message?.match(/(\d+)/);
        const hearts = heartsMatch ? parseInt(heartsMatch[1]) : 1;
        showHeartNotification(senderName, 'engagement', hearts);
        break;
        
      case 'post_like':
      case 'post_comment':
        // Obtener contenido del post si está disponible
        if (notification.post_id) {
          supabase
            .from('posts')
            .select('content')
            .eq('id', notification.post_id)
            .single()
            .then(({ data }) => {
              const postContent = data?.content || 'tu publicación';
              if (notification.type === 'post_like') {
                showReactionNotification(senderName, postContent, notification.post_id);
              } else {
                showCommentNotification(senderName, notification.message || 'comentó', notification.post_id);
              }
            });
        }
        break;
        
      case 'friend_request':
        showFriendRequestNotification(senderName, notification.sender_id);
        break;
        
      case 'message':
        showMessageNotification(senderName, notification.message || 'Te envió un mensaje', notification.sender_id);
        break;
        
      default:
        // Notificación genérica
        showMessageNotification(senderName, notification.message || 'Nueva notificación', notification.sender_id);
        break;
    }
  };

  const getToastTitle = (type: NotificationType, senderName: string): string => {
    switch (type) {
      case 'profile_heart_received':
        return '❤️ Nuevo corazón';
      case 'engagement_hearts_earned':
        return '❤️ Corazones ganados';
      case 'post_like':
        return '👍 Nueva reacción';
      case 'post_comment':
        return '💬 Nuevo comentario';
      case 'friend_request':
        return '👥 Solicitud de amistad';
      case 'message':
        return '📨 Nuevo mensaje';
      case 'mention':
        return '📢 Te han mencionado';
      default:
        return '🔔 Nueva notificación';
    }
  };

  const getToastDescription = (type: NotificationType, senderName: string): string => {
    switch (type) {
      case 'profile_heart_received':
        return `${senderName} te envió un corazón`;
      case 'engagement_hearts_earned':
        return 'Has ganado corazones por tu actividad';
      case 'post_like':
        return `${senderName} reaccionó a tu publicación`;
      case 'post_comment':
        return `${senderName} comentó en tu publicación`;
      case 'friend_request':
        return `${senderName} quiere ser tu amigo`;
      case 'message':
        return `Mensaje de ${senderName}`;
      case 'mention':
        return `${senderName} te mencionó`;
      default:
        return `Notificación de ${senderName}`;
    }
  };

  return null; // Este componente no renderiza nada
}