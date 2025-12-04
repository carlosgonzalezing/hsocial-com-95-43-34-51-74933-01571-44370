import { supabase } from "@/integrations/supabase/client";

/**
 * Function for moderators to review and act on reported posts
 * 
 * @param postId The ID of the post to take action on
 * @param action The action to take: 'approve', 'reject', or 'delete'
 * @returns A promise that resolves to an object with success status
 */
export async function handleReportedPost(postId: string, action: 'approve' | 'reject' | 'delete') {
  try {
    switch (action) {
      case 'approve':
        // Keep the post and mark reports as ignored
        await supabase.from('reports' as any)
          .update({ 
            status: 'ignored',
            updated_at: new Date().toISOString() 
          })
          .eq('post_id', postId);
        
        // Restore visibility if hidden
        await supabase
          .from('posts')
          .update({ visibility: 'public' })
          .eq('id', postId);
        break;

      case 'reject':
        // Mark reports as accepted
        await supabase.from('reports' as any)
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString() 
          })
          .eq('post_id', postId);
        
        // Keep the post hidden
        await supabase
          .from('posts')
          .update({ visibility: 'private' })
          .eq('id', postId);
        break;

      case 'delete':
        // Delete the post completely
        await supabase
          .from('posts')
          .delete()
          .eq('id', postId);
        
        // Mark reports as accepted
        await supabase.from('reports' as any)
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString() 
          })
          .eq('post_id', postId);
        break;
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling reported post:', error);
    throw error;
  }
}
