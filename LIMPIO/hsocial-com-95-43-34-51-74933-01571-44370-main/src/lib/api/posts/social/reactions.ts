
import { supabase } from "@/integrations/supabase/client";
import { ReactionType } from "@/types/database/social.types";

export async function addReaction(postId: string, reactionType: ReactionType = 'love') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // Check if reaction exists
    const { data: existingReaction, error: checkError } = await supabase
      .from("reactions")
      .select("id, reaction_type")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) throw checkError;

    // If user already reacted with the same type, remove it (toggle behavior)
    if (existingReaction && existingReaction.reaction_type === reactionType) {
      const { error: deleteError } = await supabase
        .from("reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (deleteError) throw deleteError;
      return { success: true, action: "removed" };
    }
    
    // If user reacted with a different type, update the reaction type
    else if (existingReaction) {
      const { error: updateError } = await supabase
        .from("reactions")
        .update({ reaction_type: reactionType })
        .eq("id", existingReaction.id);

      if (updateError) throw updateError;
      return { success: true, action: "updated" };
    }

    // Add new reaction
    const { error: insertError } = await supabase
      .from("reactions")
      .insert({
        post_id: postId,
        user_id: user.id,
        reaction_type: reactionType
      });

    if (insertError) throw insertError;

    // Get post author to send notification
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    // Create notification for post author (don't notify yourself)
    if (post && post.user_id !== user.id) {
      await supabase
        .from("notifications")
        .insert({
          type: "post_like",
          sender_id: user.id,
          receiver_id: post.user_id,
          post_id: postId,
          message: "reaccionó a tu publicación",
          read: false
        });
    }

    return { success: true, action: "added" };
  } catch (error) {
    console.error("Error adding reaction:", error);
    throw error;
  }
}

export async function getPostReactions(postId: string) {
  try {
    const { data, error } = await supabase
      .from("reactions")
      .select(`
        *,
        profiles:profiles(id, username, avatar_url)
      `)
      .eq("post_id", postId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return [];
  }
}
