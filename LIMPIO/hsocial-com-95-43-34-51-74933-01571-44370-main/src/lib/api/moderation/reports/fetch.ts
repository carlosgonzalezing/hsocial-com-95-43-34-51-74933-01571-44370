
import { supabase } from "@/integrations/supabase/client";
import { ReportWithUser } from "@/types/database/moderation.types";

export async function getPostReports(postId: string): Promise<ReportWithUser[]> {
  try {
    // Use raw query to avoid type errors
    const { data, error } = await supabase
      .from('reports' as any)
      .select(`
        *,
        user:profiles!reports_user_id_fkey (
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data with proper typing to avoid errors
    const transformedData: ReportWithUser[] = (data || []).map((item: any) => ({
      id: item.id,
      post_id: item.post_id,
      user_id: item.user_id,
      reason: item.reason,
      description: item.description,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user: item.user || { username: null, avatar_url: null }
    }));
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching post reports:', error);
    return [];
  }
}

export async function getReportedPosts() {
  try {
    // Use raw query to avoid type errors
    const { data, error } = await supabase
      .from('reports' as any)
      .select(`
        post_id,
        count:id(count),
        posts!reports_post_id_fkey (
          id,
          content,
          user_id,
          media_url,
          media_type,
          created_at,
          profiles (
            username,
            avatar_url
          )
        )
      `)
      .eq('status', 'pending')
      .or('post_id.is.not.null')
      .order('count', { ascending: false });

    if (error) {
      console.error('Error in getReportedPosts:', error);
      return [];
    }
    
    // Add explicit type casting to ensure proper types
    return (data || []) as any[];
  } catch (error) {
    console.error('Error fetching reported posts:', error);
    return [];
  }
}
