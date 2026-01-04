import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useProjectJoin(postId: string) {
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const handleProjectJoin = async () => {
    try {
      setIsJoining(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para unirte al proyecto",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if user already joined
      const { data: existingJoin } = await supabase
        .from('project_joins')
        .select()
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (existingJoin) {
        // User already joined, so leave the project
        await supabase
          .from('project_joins')
          .delete()
          .eq('id', existingJoin.id);
          
        toast({
          title: "Has salido del proyecto",
          description: "Ya no estás participando en este proyecto"
        });
        
        return false; // Not joined anymore
      } else {
        // Join the project
        await supabase
          .from('project_joins')
          .insert({
            post_id: postId,
            user_id: session.user.id
          });
          
        // Get post author to send notification
        const { data: post } = await supabase
          .from('posts')
          .select('user_id, content')
          .eq('id', postId)
          .single();
          
        if (post && post.user_id !== session.user.id) {
          // Send notification to post author
          await supabase
            .from('notifications')
            .insert({
              type: 'project_join',
              sender_id: session.user.id,
              receiver_id: post.user_id,
              post_id: postId,
              message: 'se ha unido a tu proyecto/idea 🤝'
            });
        }
        
        toast({
          title: "¡Te has unido al proyecto!",
          description: "El autor del proyecto ha sido notificado"
        });
        
        return true; // Successfully joined
      }
    } catch (error) {
      console.error("Error joining project:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar tu solicitud",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  return {
    isJoining,
    handleProjectJoin
  };
}