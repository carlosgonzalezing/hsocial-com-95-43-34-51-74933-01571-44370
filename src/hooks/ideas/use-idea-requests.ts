import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IdeaRequest {
  id: string;
  post_id: string;
  user_id: string;
  profession: string | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export function useIdeaRequests(postId: string) {
  return useQuery({
    queryKey: ['idea-requests', postId],
    queryFn: async (): Promise<IdeaRequest[]> => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from('idea_requests')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching idea requests:', error);
        return [];
      }

      return (data || []).map((r: any) => ({
        ...r,
        username: r.profiles?.username,
        avatar_url: r.profiles?.avatar_url,
      }));
    },
    enabled: !!postId
  });
}

export function useCreateIdeaRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      profession, 
      message,
      ideaOwnerId 
    }: { 
      postId: string; 
      profession: string; 
      message?: string;
      ideaOwnerId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Create the request
      const { data, error } = await supabase
        .from('idea_requests')
        .insert({
          post_id: postId,
          user_id: user.id,
          profession,
          message: message || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for idea owner
      await supabase.from('notifications').insert({
        receiver_id: ideaOwnerId,
        sender_id: user.id,
        type: 'idea_request',
        post_id: postId,
        message: `Ha solicitado unirse a tu idea`
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['idea-requests', variables.postId] });
      toast({
        title: "Solicitud enviada",
        description: "El creador de la idea revisará tu solicitud"
      });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({
          variant: "destructive",
          title: "Ya solicitaste",
          description: "Ya has enviado una solicitud para esta idea"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo enviar la solicitud"
        });
      }
    }
  });
}

export function useAcceptIdeaRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      postId, 
      userId,
      profession 
    }: { 
      requestId: string; 
      postId: string; 
      userId: string;
      profession: string | null;
    }) => {
      // Update request status
      const { error: updateError } = await supabase
        .from('idea_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Add to idea_participants
      const { error: participantError } = await supabase
        .from('idea_participants')
        .insert({
          post_id: postId,
          user_id: userId,
          profession
        });

      if (participantError && participantError.code !== '23505') {
        throw participantError;
      }

      // Notify the user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('notifications').insert({
          receiver_id: userId,
          sender_id: user.id,
          type: 'idea_accepted',
          post_id: postId,
          message: 'Tu solicitud para unirte a la idea fue aceptada'
        });
      }

      return { requestId, postId, userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['idea-requests', data.postId] });
      queryClient.invalidateQueries({ queryKey: ['idea-participants', data.postId] });
      toast({
        title: "Solicitud aceptada",
        description: "El usuario ha sido añadido a la idea"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo aceptar la solicitud"
      });
    }
  });
}

export function useRejectIdeaRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ requestId, postId }: { requestId: string; postId: string }) => {
      const { error } = await supabase
        .from('idea_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      return { requestId, postId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['idea-requests', data.postId] });
      toast({
        title: "Solicitud rechazada"
      });
    }
  });
}

export function useUserRequestStatus(postId: string) {
  return useQuery({
    queryKey: ['user-idea-request-status', postId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('idea_requests')
        .select('status')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      return data?.status || null;
    },
    enabled: !!postId
  });
}
