import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type IdeaRequestStatus = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';

export interface IdeaRequest {
  id: string;
  idea_id: string;
  requester_id: string;
  status: IdeaRequestStatus;
  created_at: string;
  updated_at: string;
}

export const useIdeaRequest = (ideaPostId: string) => {
  const [requestStatus, setRequestStatus] = useState<IdeaRequestStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Check if user has already requested to join this idea
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!currentUserId || !ideaPostId) return;

      try {
        const { data, error } = await supabase
          .from('idea_requests' as any)
          .select('status')
          .eq('idea_id', ideaPostId)
          .eq('requester_id', currentUserId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error checking request status:', error);
          return;
        }

        if (data) {
          setRequestStatus((data as any).status as IdeaRequestStatus);
        } else {
          setRequestStatus(null);
        }
      } catch (error) {
        console.error('Error checking request status:', error);
      }
    };

    checkExistingRequest();
  }, [ideaPostId, currentUserId]);

  // Function to send join request
  const sendJoinRequest = async (ideaCreatorId: string) => {
    if (!currentUserId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para solicitar unirte",
      });
      return false;
    }

    if (currentUserId === ideaCreatorId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No puedes solicitar unirte a tu propia idea",
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Insert the join request
      const { data: requestData, error: requestError } = await supabase
        .from('idea_requests' as any)
        .insert({
          idea_id: ideaPostId,
          requester_id: currentUserId,
          status: 'PENDIENTE'
        })
        .select()
        .single();

      if (requestError) {
        if (requestError.code === '23505') { // Unique constraint violation
          toast({
            variant: "destructive",
            title: "Ya solicitaste unirte",
            description: "Ya has enviado una solicitud para unirte a esta idea",
          });
        } else {
          throw requestError;
        }
        return false;
      }

      // Create notification for the idea creator
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'idea_join_request',
          sender_id: currentUserId,
          receiver_id: ideaCreatorId,
          post_id: ideaPostId,
          read: false,
          content: 'quiere unirse a tu idea'
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the whole operation if notification fails
      }

      setRequestStatus('PENDIENTE');
      
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud ha sido enviada al creador de la idea",
      });

      return true;
    } catch (error) {
      console.error('Error sending join request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la solicitud. Inténtalo de nuevo",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to cancel a pending request
  const cancelJoinRequest = async () => {
    if (!currentUserId) return false;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('idea_requests' as any)
        .delete()
        .eq('idea_id', ideaPostId)
        .eq('requester_id', currentUserId)
        .eq('status', 'PENDIENTE');

      if (error) throw error;

      setRequestStatus(null);
      
      toast({
        title: "Solicitud cancelada",
        description: "Has cancelado tu solicitud para unirte",
      });

      return true;
    } catch (error) {
      console.error('Error canceling join request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cancelar la solicitud",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check if max members limit has been reached
  const checkMaxMembersLimit = async (maxMembers: number | null | undefined): Promise<boolean> => {
    if (!maxMembers) return false; // No limit set

    try {
      // Count current participants
      const { data, error } = await supabase
        .from('idea_participants')
        .select('id', { count: 'exact' })
        .eq('idea_id', ideaPostId);

      if (error) throw error;

      const currentCount = data?.length || 0;
      return currentCount >= maxMembers;
    } catch (error) {
      console.error('Error checking max members:', error);
      return false;
    }
  };

  return {
    requestStatus,
    isLoading,
    sendJoinRequest,
    cancelJoinRequest,
    checkMaxMembersLimit,
    currentUserId
  };
};
