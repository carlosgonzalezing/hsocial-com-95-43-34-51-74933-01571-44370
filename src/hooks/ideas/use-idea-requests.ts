import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IdeaRequest {
  id: string;
  post_id: string;
  user_id: string;
  profession: string | null;
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

      // Compatibility mode: some deployments don't have idea_requests columns in PostgREST cache.
      // We return an empty list and rely on notifications + participants instead.
      return [];
    },
    enabled: !!postId
  });
}

export function useCreateIdeaRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getOrCreatePrivateChannel = async (userId1: string, userId2: string): Promise<string | null> => {
    try {
      const { data: user1Channels, error: searchError } = await supabase
        .from("miembros_canal")
        .select(`
          id_canal,
          canales!inner(id, es_privado)
        `)
        .eq("id_usuario", userId1)
        .eq("canales.es_privado", true);

      if (searchError) throw searchError;

      if (user1Channels && user1Channels.length > 0) {
        for (const memberChannel of user1Channels as any[]) {
          const channelId = memberChannel.id_canal;
          const { data: members } = await supabase
            .from("miembros_canal")
            .select("id_usuario")
            .eq("id_canal", channelId);

          if (members && members.length === 2) {
            const memberIds = (members as any[]).map((m) => m.id_usuario);
            if (memberIds.includes(userId1) && memberIds.includes(userId2)) {
              return channelId;
            }
          }
        }
      }

      const { data: newChannel, error: createError } = await supabase
        .from("canales")
        .insert({
          nombre: "Chat privado",
          es_privado: true,
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!newChannel) return null;

      await supabase.from("miembros_canal").insert([
        { id_canal: (newChannel as any).id, id_usuario: userId1 },
        { id_canal: (newChannel as any).id, id_usuario: userId2 },
      ]);

      return (newChannel as any).id;
    } catch (error) {
      console.error("Error getting/creating private channel:", error);
      return null;
    }
  };

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

      // Create notification for idea owner
      await supabase.from('notifications').insert({
        receiver_id: ideaOwnerId,
        sender_id: user.id,
        type: 'idea_request',
        post_id: postId,
        message: `Habilidad/Profesión: ${profession}`
      });

      // Send message to idea owner inbox (existing chat system)
      const channelId = await getOrCreatePrivateChannel(user.id, ideaOwnerId);
      if (channelId) {
        const contentLines = [
          'Solicitud para unirse a tu idea',
          `Habilidad/Profesión: ${profession}`,
          message ? `Mensaje: ${message}` : null,
        ].filter(Boolean);

        await supabase
          .from('mensajes')
          .insert({
            contenido: contentLines.join('\n'),
            id_canal: channelId,
            id_autor: user.id,
          } as any);
      }

      return { ok: true };
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
      postId, 
      userId,
      profession 
    }: { 
      postId: string; 
      userId: string;
      profession: string | null;
    }) => {
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

      return { postId, userId };
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
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('notifications').insert({
          receiver_id: userId,
          sender_id: user.id,
          type: 'idea_rejected',
          post_id: postId,
          message: 'Tu solicitud para unirte a la idea fue rechazada'
        });
      }
      return { postId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['idea-requests', data.postId] });
      toast({
        title: "Solicitud rechazada"
      });
    }
  });
}

export function useUserRequestStatus(postId: string, ideaOwnerId?: string) {
  return useQuery({
    queryKey: ['user-idea-request-status', postId, ideaOwnerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Accepted if user is already a participant
      const { data: participation } = await supabase
        .from('idea_participants')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (participation) return 'accepted' as const;

      // If user received a rejected/accepted notification for this post
      const { data: decisionNotifs } = await supabase
        .from('notifications')
        .select('type')
        .eq('receiver_id', user.id)
        .eq('post_id', postId)
        .in('type', ['idea_accepted', 'idea_rejected'])
        .order('created_at', { ascending: false })
        .limit(1);

      const lastDecision = decisionNotifs?.[0]?.type;
      if (lastDecision === 'idea_rejected') return 'rejected' as const;
      if (lastDecision === 'idea_accepted') return 'accepted' as const;

      // Pending if the user already sent a request notification to the idea owner
      if (ideaOwnerId) {
        const { data: sent } = await supabase
          .from('notifications')
          .select('id')
          .eq('sender_id', user.id)
          .eq('receiver_id', ideaOwnerId)
          .eq('type', 'idea_request')
          .eq('post_id', postId)
          .limit(1);

        if (sent && sent.length > 0) return 'pending' as const;
      }

      return null;
    },
    enabled: !!postId
  });
}
