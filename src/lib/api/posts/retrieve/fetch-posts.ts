
import { supabase } from "@/integrations/supabase/client";
import { transformPostsData } from "./utils/transform-data";
import { sortPosts } from "./utils/transform-data";

export async function fetchRawPosts(userId?: string) {
  try {
    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles:profiles(*),
        comments:comments(count)
      `);

    // Si hay un userId, solo obtener los posts de ese usuario
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(20); // Limit initial load to 20 posts for better performance

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchRawPosts:", error);
    throw error;
  }
}
