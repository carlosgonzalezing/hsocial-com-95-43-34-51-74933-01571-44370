
import { supabase } from "@/integrations/supabase/client";
import type { Visibility } from "../types";

interface UpdatePostParams {
  postId: string;
  content?: string;
  visibility?: Visibility;
}

export async function updatePostVisibility(postId: string, visibility: Visibility) {
  try {
    // Make sure visibility is one of the allowed values to satisfy TypeScript
    const safeVisibility = visibility === 'incognito' ? 'private' : visibility;
    
    const { error } = await supabase
      .from('posts')
      .update({ visibility: safeVisibility })
      .eq('id', postId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating post visibility:", error);
    return { success: false, error };
  }
}

export async function updatePost({ postId, content, visibility }: UpdatePostParams) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Build update object
    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    
    if (visibility !== undefined) {
      // Make sure visibility is one of the allowed values
      updateData.visibility = visibility === 'incognito' ? 'private' : visibility;
    }

    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, error };
  }
}
