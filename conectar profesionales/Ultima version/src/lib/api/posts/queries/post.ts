
import { supabase } from "@/integrations/supabase/client";

export async function getPostById(postId: string) {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:profiles(*),
        comments:comments(count)
      `)
      .eq("id", postId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
}

export async function getPostsByUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:profiles(*),
        comments:comments(count)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
}
