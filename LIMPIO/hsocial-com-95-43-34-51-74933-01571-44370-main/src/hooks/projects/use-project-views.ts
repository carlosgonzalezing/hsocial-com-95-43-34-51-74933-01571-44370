import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectViewer {
  viewer_id: string;
  username: string;
  avatar_url: string | null;
  viewed_at: string;
}

export function useProjectViews(postId: string) {
  const queryClient = useQueryClient();

  // Fetch views count
  const { data: viewsCount = 0 } = useQuery({
    queryKey: ['project-views-count', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_project_views_count', { p_post_id: postId });
      
      if (error) throw error;
      return data || 0;
    },
    enabled: !!postId
  });

  // Fetch viewers list
  const { data: viewers = [] } = useQuery({
    queryKey: ['project-viewers', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_project_viewers', { p_post_id: postId, p_limit: 10 });
      
      if (error) throw error;
      return (data || []) as ProjectViewer[];
    },
    enabled: !!postId
  });

  // Record view mutation
  const recordView = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('project_views')
        .upsert({
          post_id: postId,
          viewer_id: user?.id || null
        }, {
          onConflict: 'post_id,viewer_id',
          ignoreDuplicates: true
        });
      
      if (error && error.code !== '23505') { // Ignore unique constraint violations
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-views-count', postId] });
      queryClient.invalidateQueries({ queryKey: ['project-viewers', postId] });
    }
  });

  // Auto-record view when component mounts
  useEffect(() => {
    if (postId) {
      recordView.mutate();
    }
  }, [postId]);

  return {
    viewsCount,
    viewers,
    recordView: recordView.mutate
  };
}
