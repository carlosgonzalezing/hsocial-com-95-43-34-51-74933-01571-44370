
import { supabase } from "@/integrations/supabase/client";

export async function fetchPostComments(postId: string) {
  try {
    // Fetch comments without reactions embed to avoid ambiguity
    let { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url,
          id
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    if (!comments || comments.length === 0) {
      return [];
    }

    // Get comment IDs
    const commentIds = comments.map(c => c.id);

    // Fetch reactions for all comments separately
    const { data: reactions } = await supabase
      .from("reactions")
      .select("id, comment_id, reaction_type, user_id")
      .in("comment_id", commentIds);

    // Group reactions by comment_id
    const reactionsByComment: Record<string, any[]> = {};
    if (reactions) {
      reactions.forEach(reaction => {
        if (!reactionsByComment[reaction.comment_id]) {
          reactionsByComment[reaction.comment_id] = [];
        }
        reactionsByComment[reaction.comment_id].push(reaction);
      });
    }

    // Attach reactions to comments
    const commentsWithReactions = comments.map(comment => ({
      ...comment,
      reactions: reactionsByComment[comment.id] || []
    }));

    return commentsWithReactions;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function createComment(postId: string, content: string, parentId?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("comments")
      .insert({
        content,
        user_id: user.id,
        post_id: postId,
        parent_id: parentId || null
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error };
  }
}
