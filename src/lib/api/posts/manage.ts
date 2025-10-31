import { supabase } from "@/integrations/supabase/client";

export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}

export async function updatePostVisibility(postId: string, visibility: 'public' | 'friends' | 'private') {
  const { error } = await supabase
    .from('posts')
    .update({ visibility })
    .eq('id', postId);

  if (error) throw error;
}

export async function hidePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Usuario no autenticado');
    
    const { data: existingHiddenPost, error: checkError } = await supabase
      .from('hidden_posts')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error al verificar publicación oculta:", checkError);
      throw checkError;
    }
    
    if (existingHiddenPost) {
      return;
    }
    
    const { error } = await supabase
      .from('hidden_posts')
      .insert({ 
        post_id: postId,
        user_id: user.id
      });
    
    if (error) {
      console.error("Error al ocultar publicación:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error completo al ocultar publicación:", error);
    throw error;
  }
}

export async function unhidePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Usuario no autenticado');
    
    const { error } = await supabase
      .from('hidden_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error al mostrar publicación:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error completo al mostrar publicación:", error);
    throw error;
  }
}

export async function getHiddenPosts() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('hidden_posts')
      .select('post_id')
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error al obtener publicaciones ocultas:", error);
      throw error;
    }
    
    return data.map(item => item.post_id);
  } catch (error) {
    console.error("Error completo al obtener publicaciones ocultas:", error);
    return [];
  }
}

export async function setPostInterest(postId: string, interestLevel: 'interested' | 'not_interested') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');
  
  const { data: existingInterest } = await supabase
    .from('post_interests')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();
  
  if (existingInterest) {
    const { error } = await supabase
      .from('post_interests')
      .update({ interest_level: interestLevel })
      .eq('id', existingInterest.id);
    
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('post_interests')
      .insert({
        post_id: postId,
        user_id: user.id,
        interest_level: interestLevel
      });
    
    if (error) throw error;
  }
}

export async function updatePost(params: { postId: string; content?: string; visibility?: 'public' | 'friends' | 'private' }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const updateData: any = {};
    if (params.content !== undefined) updateData.content = params.content;
    if (params.visibility !== undefined) updateData.visibility = params.visibility;

    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', params.postId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, error };
  }
}

// hidden_users table removed - stub functions
export async function hideUser(userId: string) {
  console.log('Hide user feature disabled');
}

export async function unhideUser(userId: string) {
  console.log('Unhide user feature disabled');
}
