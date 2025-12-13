
import { supabase } from "@/integrations/supabase/client";

export async function deletePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // Get post to check ownership
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id, media_url")
      .eq("id", postId)
      .single();

    if (fetchError) throw fetchError;

    // Verify ownership
    if (post && post.user_id !== user.id) {
      throw new Error("You don't have permission to delete this post");
    }

    // Delete post
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) throw deleteError;

    // Delete associated media if exists
    if (post && post.media_url) {
      // Extract file path from URL
      const url = new URL(post.media_url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('media') + 1).join('/');
      
      if (filePath) {
        await supabase
          .storage
          .from("media")
          .remove([filePath]);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}
