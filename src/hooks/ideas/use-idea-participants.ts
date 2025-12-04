import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface IdeaParticipant {
  user_id: string;
  profession: string | null;
  joined_at: string;
  username: string | null;
  avatar_url: string | null;
}

export function useIdeaParticipants(postId: string) {
  return useQuery({
    queryKey: ['idea-participants', postId],
    queryFn: async (): Promise<IdeaParticipant[]> => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from('idea_participants')
        .select(`
          user_id,
          profession,
          joined_at,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId);

      if (error) {
        console.error('Error fetching idea participants:', error);
        return [];
      }

      return (data || []).map((p: any) => ({
        user_id: p.user_id,
        profession: p.profession,
        joined_at: p.joined_at,
        username: p.profiles?.username || null,
        avatar_url: p.profiles?.avatar_url || null,
      }));
    },
    enabled: !!postId
  });
}
