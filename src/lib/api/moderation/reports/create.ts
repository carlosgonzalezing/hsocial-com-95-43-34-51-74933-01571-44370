import { supabase } from "@/integrations/supabase/client";
import { ReportReason, ReportPostParams } from "../types";
import { tableExists } from "../utils";

export async function createReport(
  postId: string,
  userId: string,
  reason: ReportReason,
  description: string = ''
) {
  try {
    // Prefer post_reports (exists in schema). Fallback to legacy reports if present.
    const postReportsExists = await tableExists('post_reports');
    const legacyReportsExists = postReportsExists ? false : await tableExists('reports');
    const targetTable = postReportsExists ? 'post_reports' : (legacyReportsExists ? 'reports' : null);
    if (!targetTable) {
      return { success: false, error: "No existe una tabla de reportes ('post_reports' / 'reports')" };
    }

    // Create report in the database using RPC if available
    let reportData;
    try {
      // Try RPC (optional). If missing, we will fallback to direct insert.
      const rpcCall = supabase.rpc;
      const result = await (rpcCall as any)('create_report', {
        p_post_id: postId,
        p_user_id: userId,
        p_reason: reason,
        p_description: description
      });

      const { data, error: reportError } = result;
      if (reportError) throw reportError;
      reportData = data;
    } catch (error) {
      // Fallback to direct query if RPC doesn't exist
      const { data: directReport, error: directError } = await supabase
        .from(targetTable as any)
        .insert({
          post_id: postId,
          user_id: userId,
          reason,
          description,
          status: 'pending',
        })
        .select();

      if (directError) {
        const message = (directError as any)?.message?.toLowerCase?.() ?? '';
        const code = (directError as any)?.code;
        const missingColumn = code === '42703' || message.includes('column') && (message.includes('status') || message.includes('description'));

        if (missingColumn) {
          const { data: minimalReport, error: minimalError } = await supabase
            .from(targetTable as any)
            .insert({
              post_id: postId,
              user_id: userId,
              reason,
            })
            .select();

          if (!minimalError) {
            reportData = minimalReport;
          } else {
            if ((minimalError as any).code === '23505') {
              return { success: false, error: 'Ya reportaste esta publicación anteriormente.' };
            }
            return { success: false, error: minimalError.message };
          }
        } else {
          if ((directError as any).code === '23505') {
            return { success: false, error: 'Ya reportaste esta publicación anteriormente.' };
          }
          return { success: false, error: directError.message };
        }
      } else {
        reportData = directReport;
      }
    }

    // Check if we need to auto-hide the post (5+ reports in 10 minutes)
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    const { data: recentReports, error: recentReportsError } = await supabase
      .from(targetTable as any)
      .select('id')
      .eq('post_id', postId)
      .gte('created_at', tenMinutesAgo.toISOString());

    if (!recentReportsError && recentReports && recentReports.length >= 5) {
      await supabase
        .from('posts')
        .update({ visibility: 'private' })
        .eq('id', postId);
    }

    return { success: true, data: reportData };
  } catch (error: any) {
    console.error("Error creating report:", error);
    return { success: false, error: error.message };
  }
}

// Keeping for backward compatibility
export function reportPost(params: ReportPostParams) {
  return createReport(params.postId, params.userId, params.reason, params.description);
}
