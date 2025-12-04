import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  acceptFriendRequest, 
  rejectFriendRequest, 
  cancelFriendRequest,
  sendFriendRequest
} from "@/lib/api/friends";

interface SimpleUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface SimpleFriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user: SimpleUser;
}

export function useSimpleFriendRequests(currentUserId: string | null) {
  const [pendingRequests, setPendingRequests] = useState<SimpleFriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SimpleFriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadAllFriendData = useCallback(async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_friend_requests_data', {
        user_id_param: currentUserId
      });

      if (error) throw error;
      
      // Procesar solicitudes pendientes (recibidas)
      const result = data as any;
      const pendingData = Array.isArray(result?.[0]?.pending_requests) ? result[0].pending_requests : [];
      const formattedPending: SimpleFriendRequest[] = pendingData.map((request: any) => ({
        id: request.id,
        user_id: request.sender.id,
        friend_id: currentUserId,
        status: request.status,
        created_at: request.created_at,
        user: request.sender
      }));
      
      // Procesar solicitudes enviadas
      const sentData = Array.isArray(result?.[0]?.sent_requests) ? result[0].sent_requests : [];
      const formattedSent: SimpleFriendRequest[] = sentData.map((request: any) => ({
        id: request.id,
        user_id: currentUserId,
        friend_id: request.friend.id,
        status: request.status,
        created_at: request.created_at,
        user: request.friend
      }));
      
      setPendingRequests(formattedPending);
      setSentRequests(formattedSent);
    } catch (error) {
      console.error('Error loading friend requests data:', error);
      setPendingRequests([]);
      setSentRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const refreshData = useCallback(async () => {
    await loadAllFriendData();
  }, [loadAllFriendData]);

  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const success = await acceptFriendRequest(requestId, senderId);
      if (success) {
        toast({
          title: "Solicitud aceptada",
          description: "Ahora son amigos"
        });
        await refreshData();
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo aceptar la solicitud"
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const success = await rejectFriendRequest(requestId);
      if (success) {
        toast({
          title: "Solicitud rechazada",
          description: "Has rechazado la solicitud de amistad"
        });
        await refreshData();
      } else {
        throw new Error("Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo rechazar la solicitud"
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const success = await cancelFriendRequest(requestId);
      if (success) {
        toast({
          title: "Solicitud cancelada",
          description: "Has cancelado la solicitud de amistad"
        });
        await refreshData();
      } else {
        throw new Error("Failed to cancel request");
      }
    } catch (error) {
      console.error("Error canceling request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cancelar la solicitud"
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('friendship-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `user_id=eq.${currentUserId}`
      }, () => {
        refreshData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `friend_id=eq.${currentUserId}`
      }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, refreshData]);

  // Initial load
  useEffect(() => {
    if (currentUserId) {
      loadAllFriendData();
    }
  }, [currentUserId, loadAllFriendData]);

  return {
    pendingRequests,
    sentRequests,
    loading,
    actionLoading,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelRequest,
    refreshData
  };
}