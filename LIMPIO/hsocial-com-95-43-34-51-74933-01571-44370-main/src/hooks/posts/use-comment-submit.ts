
import { useToast } from "@/hooks/use-toast";
import { uploadMediaFile, getMediaType } from "@/lib/api/posts/storage";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { sendMentionNotifications } from "@/lib/api/posts/notifications";

/**
 * Hook for submitting comments to a post
 */
export function useCommentSubmit(
  postId: string,
  setNewComment: (value: string) => void,
  setCommentImage: (value: File | null) => void,
  setReplyTo: (value: { id: string; username: string } | null) => void
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const handleSubmitComment = async (
    newComment: string,
    commentImage: File | null,
    replyTo: { id: string; username: string } | null
  ) => {
    if (!newComment.trim() && !commentImage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El comentario no puede estar vacío",
      });
      return;
    }
    
    try {
      let mediaUrl = null;
      let mediaType = null;
      
      if (commentImage) {
        // Subir la imagen al storage
        mediaUrl = await uploadMediaFile(commentImage);
        mediaType = getMediaType(commentImage);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para comentar");
      
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment,
          parent_id: replyTo?.id || null,
          media_url: mediaUrl,
          media_type: mediaType
        })
        .select()
        .single();
      
      if (commentError) throw commentError;
      
      if (newComment.includes('@')) {
        await sendMentionNotifications(
          newComment, 
          postId, 
          commentData.id, 
          user.id
        );
      }
      
      setNewComment("");
      setCommentImage(null);
      setReplyTo(null);
      
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      
      toast({
        title: "Comentario publicado",
        description: "Tu comentario se ha publicado correctamente",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo publicar el comentario",
      });
    }
  };
  
  return { handleSubmitComment };
}
