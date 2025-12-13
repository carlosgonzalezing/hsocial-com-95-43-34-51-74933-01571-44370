
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CommentData } from "./types";

export function useCommentMutations(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: submitComment } = useMutation({
    mutationFn: async (data: CommentData) => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.user) {
        throw new Error("Debes iniciar sesión para comentar");
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          content: data.content,
          post_id: postId,
          user_id: currentSession.user.id,
          parent_id: data.replyToId
        });

      if (error) throw error;

      // Get post author to send notification
      const { data: post } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single();

      // Create notification for post author (don't notify yourself)
      if (post && post.user_id !== currentSession.user.id) {
        await supabase
          .from("notifications")
          .insert({
            type: "post_comment",
            sender_id: currentSession.user.id,
            receiver_id: post.user_id,
            post_id: postId,
            message: "comentó en tu publicación",
            read: false
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast({
        title: "Comentario añadido",
        description: "Tu comentario se ha publicado correctamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo publicar el comentario",
      });
    },
  });

  return { submitComment };
}
