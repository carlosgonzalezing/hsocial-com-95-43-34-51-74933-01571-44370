
import { supabase } from "@/integrations/supabase/client";

export async function updateReportStatus(reportId: string, status: 'reviewed' | 'ignored' | 'accepted') {
  try {
    // Use proper typing for reports table
    const { data, error } = await supabase.from('reports' as any)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
}

// Re-export the function from the new location for backward compatibility
export { handleReportedPost } from "../posts/actions";
