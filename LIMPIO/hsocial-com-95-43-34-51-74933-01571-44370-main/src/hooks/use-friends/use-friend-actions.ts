
import { 
  sendFriendRequest, 
  unfollowUser,
  acceptFriendRequest, 
  rejectFriendRequest, 
  cancelFriendRequest 
} from "@/lib/api/friends";
import { useToast } from "@/hooks/use-toast";
// Engagement tracking removed for performance

export function useFriendActions(
  currentUserId: string | null, 
  onUpdate: () => Promise<void>
) {
  const { toast } = useToast();

  const followUser = async (friendId: string) => {
    if (!currentUserId) return;

    try {
      await sendFriendRequest(friendId);
      
      // Interaction streak tracking removed for performance
      
      toast({
        title: "Solicitud enviada",
        description: "Has enviado una solicitud de amistad"
      });
      await onUpdate();
    } catch (error) {
      console.error("Error following user:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud",
        variant: "destructive"
      });
    }
  };

  const unfollowUserAction = async (friendId: string) => {
    if (!currentUserId) return;

    try {
      await unfollowUser(friendId);
      toast({
        title: "Dejaste de seguir",
        description: "Has dejado de seguir a este usuario"
      });
      await onUpdate();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast({
        title: "Error",
        description: "No se pudo dejar de seguir al usuario",
        variant: "destructive"
      });
    }
  };

  const handleFriendRequest = async (requestId: string, senderId: string, accept: boolean) => {
    try {
      if (accept) {
        await acceptFriendRequest(requestId, senderId);
        toast({
          title: "Solicitud aceptada",
          description: "Ahora son amigos"
        });
      } else {
        await rejectFriendRequest(requestId);
        toast({
          title: "Solicitud rechazada",
          description: "Has rechazado la solicitud de amistad"
        });
      }
      
      // Actualizamos los datos
      await onUpdate();
    } catch (error) {
      console.error("Error handling friend request:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive"
      });
    }
  };

  const cancelSentRequest = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
      toast({
        title: "Solicitud cancelada",
        description: "Has cancelado la solicitud de amistad"
      });
      
      // Actualizamos los datos
      await onUpdate();
    } catch (error) {
      console.error("Error canceling friend request:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la solicitud",
        variant: "destructive"
      });
    }
  };

  return {
    followUser,
    unfollowUser: unfollowUserAction,
    handleFriendRequest,
    cancelSentRequest,
  };
}
