
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePostTogglePin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      postId, 
      isPinned 
    }: { 
      postId: string; 
      isPinned: boolean; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verify ownership before updating
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();
      
      if (fetchError) throw fetchError;
      if (post.user_id !== user.id) {
        throw new Error('No tienes permiso para modificar esta publicación');
      }

      // Call the RPC function to handle the pinning operation
      const { data, error } = await supabase.rpc(
        'toggle_post_pin', 
        { 
          post_id: postId,
          pin_status: !isPinned
        }
      );

      if (error) throw error;
      
      return { 
        success: true,
        isPinned: !isPinned
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
    }
  });
}
