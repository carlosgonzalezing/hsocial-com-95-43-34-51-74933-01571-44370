
import { supabase } from "@/integrations/supabase/client";

export async function fetchRawPosts(userId?: string) {
  try {
    console.log('📊 fetchRawPosts: Starting fetch', { userId });
    
    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles:profiles(*),
        comments:comments(count),
        post_reports:post_reports(count),
        academic_events:academic_events(*),
        shared_post:posts!shared_post_id(
          *,
          profiles:profiles(*),
          comments:comments(count),
          academic_events:academic_events(*)
        )
      `);

    // Exclude project_showcase posts from feed (they should only appear in Projects page)
    query = query.neq('post_type', 'project_showcase');

    // Si hay un userId, solo obtener los posts de ese usuario
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(20); // Limit initial load to 20 posts for better performance

    if (error) {
      console.error('❌ fetchRawPosts error:', error);
      throw error;
    }
    
    const sharedPostsCount = data?.filter(p => p.shared_post_id)?.length || 0;
    console.log('✅ fetchRawPosts: Success', { 
      count: data?.length || 0,
      sharedPostsCount,
      sharedPostsData: data?.filter(p => p.shared_post_id).map(p => ({
        id: p.id,
        has_shared_post_data: !!p.shared_post,
        shared_post_id: p.shared_post_id
      }))
    });
    return data || [];
  } catch (error) {
    console.error("❌ Error in fetchRawPosts:", error);
    throw error;
  }
}
