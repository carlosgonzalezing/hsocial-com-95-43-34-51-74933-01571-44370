import { supabase } from "@/integrations/supabase/client";
import { ReactionType } from "@/types/database/social.types";

interface ReactionResult {
  success: boolean;
  action?: 'added' | 'removed';
  reaction_type?: ReactionType | null;
  error?: string;
}

/**
 * API optimizada para reacciones usando función de base de datos
 * Previene duplicados, auto-reacciones y usa transacciones atómicas
 */
export async function toggleReactionOptimized(
  postId?: string,
  commentId?: string,
  reactionType: ReactionType = 'love'
): Promise<ReactionResult> {
  try {
    const { data, error } = await supabase.rpc('add_reaction_optimized', {
      p_post_id: postId || null,
      p_comment_id: commentId || null,
      p_reaction_type: reactionType
    });

    if (error) {
      console.error('Error calling add_reaction_optimized:', error);
      return { success: false, error: error.message };
    }

    // Asegurar que el data tenga la estructura correcta
    if (data && typeof data === 'object' && 'success' in data) {
      return data as unknown as ReactionResult;
    }

    // Fallback si la respuesta no tiene el formato esperado
    return { success: false, error: 'Respuesta inesperada del servidor' };
  } catch (error: any) {
    console.error('Error in toggleReactionOptimized:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener la reacción actual del usuario para un post
 */
export async function getUserPostReaction(postId: string): Promise<ReactionType | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('reactions')
      .select('reaction_type')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user post reaction:', error);
      return null;
    }

    return data?.reaction_type as ReactionType || null;
  } catch (error) {
    console.error('Error in getUserPostReaction:', error);
    return null;
  }
}

/**
 * Obtener la reacción actual del usuario para un comentario
 */
export async function getUserCommentReaction(commentId: string): Promise<ReactionType | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('reactions')
      .select('reaction_type')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user comment reaction:', error);
      return null;
    }

    return data?.reaction_type as ReactionType || null;
  } catch (error) {
    console.error('Error in getUserCommentReaction:', error);
    return null;
  }
}