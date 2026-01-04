
import type { NotificationType } from "@/types/notifications";

export const formatNotificationMessage = (type: NotificationType, username: string) => {
  switch (type) {
    case 'friend_request':
      return `${username} te ha enviado una solicitud de amistad`;
    case 'idea_request':
      return `${username} solicitó unirse a tu idea`;
    case 'idea_accepted':
      return `${username} aceptó tu solicitud para unirte a una idea`;
    case 'idea_rejected':
      return `${username} rechazó tu solicitud para unirte a una idea`;
    case 'idea_join':
      return `${username} se unió a tu idea`;
    case 'idea_leave':
      return `${username} abandonó tu idea`;
    case 'post_comment':
      return `${username} ha comentado en tu publicación`;
    case 'comment_reply':
      return `${username} ha respondido a tu comentario`;
    case 'post_like':
      return `A ${username} le ha gustado tu publicación`;
    case 'new_post':
      return `${username} ha publicado algo nuevo`;
    case 'friend_accepted':
      return `${username} ha aceptado tu solicitud de amistad`;
    case 'mention':
      return `${username} te ha mencionado en una publicación`;
    default:
      return `Nueva notificación de ${username}`;
  }
};
