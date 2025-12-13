import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MentionUser } from "./types";

export function useMentionSearch() {
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (mentionSearch.length === 0) {
      setMentionUsers([]);
      return;
    }

    const searchForUsers = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log("Searching for users with query:", mentionSearch);
        
        // Search all users (simplified, no friendships filtering)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .neq('id', user.id)
          .ilike('username', `%${mentionSearch}%`)
          .order('username')
          .limit(10);

        if (error) {
          console.error("Error fetching users:", error);
          return;
        }
        
        const users = (data || []).map(profile => ({
          id: profile.id,
          username: profile.username || '',
          avatar_url: profile.avatar_url,
          relationship: null
        }));
        
        setMentionUsers(users);
      } catch (error) {
        console.error('Error searching for users:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los usuarios para mención"
        });
      }
    };

    if (mentionSearch.length > 0) {
      searchForUsers();
    }
  }, [mentionSearch, toast]);

  return {
    mentionUsers,
    mentionSearch,
    setMentionSearch
  };
}
