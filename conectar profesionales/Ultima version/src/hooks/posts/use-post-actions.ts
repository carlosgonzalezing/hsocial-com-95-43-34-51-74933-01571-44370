
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for managing post actions like deletion
 */
export function usePostActions(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const onDeletePost = async () => {
    try {
      // First, get the post to check media files and type
      const { data: post } = await supabase
        .from('posts')
        .select('post_type, media_url')
        .eq('id', postId)
        .single();
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Delete media files from storage if they exist
      const mediaUrlsToDelete: string[] = [];
      
      // Collect all media URLs - handle both single URL and JSON array
      if (post.media_url) {
        // Check if it's a JSON array string
        if (typeof post.media_url === 'string' && post.media_url.startsWith('[')) {
          try {
            const urlsArray = JSON.parse(post.media_url);
            if (Array.isArray(urlsArray)) {
              mediaUrlsToDelete.push(...urlsArray);
            } else {
              mediaUrlsToDelete.push(post.media_url);
            }
          } catch {
            // Not JSON, treat as single URL
            mediaUrlsToDelete.push(post.media_url);
          }
        } else {
          // Single URL
          mediaUrlsToDelete.push(post.media_url);
        }
      }
      
      // Delete each media file from storage
      for (const url of mediaUrlsToDelete) {
        try {
          // Extract file path from URL (assumes Supabase storage URL format)
          const urlPath = url.split('/storage/v1/object/public/')[1];
          if (urlPath) {
            const [bucket, ...pathParts] = urlPath.split('/');
            const filePath = pathParts.join('/');
            
            const { error: storageError } = await supabase.storage
              .from(bucket)
              .remove([filePath]);
            
            if (storageError) {
              console.warn('Error deleting media file:', storageError);
              // Continue anyway - don't block post deletion
            }
          }
        } catch (storageErr) {
          console.warn('Error processing media URL:', storageErr);
          // Continue anyway
        }
      }
      
      // If it's an idea, delete participants first
      if (post.post_type === 'idea') {
        const { error: participantsError } = await supabase
          .from('idea_participants')
          .delete()
          .eq('post_id', postId);
        
        if (participantsError) {
          console.error('Error deleting idea participants:', participantsError);
        }
      }
      
      // Delete comments (cascade should handle this, but being explicit)
      await supabase
        .from('comments')
        .delete()
        .eq('post_id', postId);
      
      // Delete reactions
      await supabase
        .from('reactions')
        .delete()
        .eq('post_id', postId);
      
      // Now delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['personalized-feed'] });
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      
      toast({
        title: "Publicación eliminada",
        description: "La publicación se ha eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la publicación. Por favor, intenta de nuevo.",
      });
    }
  };
  
  return { onDeletePost };
}
