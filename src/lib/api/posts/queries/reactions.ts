
import { supabase } from "@/integrations/supabase/client";

export async function getUserReaction(postId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from("reactions")
      .select("reaction_type")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data?.reaction_type || null;
  } catch (error) {
    console.error("Error fetching user reaction:", error);
    return null;
  }
}

export async function getReactionsForPosts(postIds: string[]) {
  if (!postIds.length) return {};
  
  try {
    const { data, error } = await supabase
      .from("reactions")
      .select("post_id, reaction_type, user_id")
      .in("post_id", postIds);

    if (error) throw error;
    
    // Group by post_id
    const result: Record<string, any[]> = {};
    postIds.forEach(id => { result[id] = []; });
    
    (data || []).forEach(reaction => {
      if (!result[reaction.post_id]) {
        result[reaction.post_id] = [];
      }
      result[reaction.post_id].push(reaction);
    });
    
    return result;
  } catch (error) {
    console.error("Error fetching reactions for posts:", error);
    return {};
  }
}

export async function getReactionsWithProfiles(postId: string) {
  try {
    const { data, error } = await supabase
      .from("reactions")
      .select(`
        id,
        reaction_type,
        created_at,
        user_id,
        profiles (
          username,
          avatar_url
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      id: item.id,
      reaction_type: item.reaction_type,
      username: item.profiles?.username || "Usuario",
      avatar_url: item.profiles?.avatar_url,
      user_id: item.user_id
    }));
  } catch (error) {
    console.error("Error fetching reactions with profiles:", error);
    return [];
  }
}
