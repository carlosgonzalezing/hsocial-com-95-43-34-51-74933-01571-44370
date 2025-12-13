
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FriendSuggestion } from "@/types/friends";

export function usePeopleSuggestions() {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedFriends, setDismissedFriends] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        // Check if user is authenticated before fetching suggestions
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setSuggestions([]);
          return;
        }
        
        // Get people suggestions based on similar careers/institutions
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, career, semester, institution_name')
          .neq('id', user.id)
          .limit(10);

        if (error) throw error;

        // Transform to FriendSuggestion format
        const suggestions: FriendSuggestion[] = (profiles || []).map(profile => ({
          id: profile.id,
          username: profile.username || 'Usuario',
          avatar_url: profile.avatar_url,
          mutual_friends_count: 0, // Could be enhanced later
          career: profile.career,
          semester: profile.semester
        }));

        setSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching friend suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);


  const handleDismiss = (friendId: string) => {
    setDismissedFriends(prev => ({
      ...prev, 
      [friendId]: true
    }));
  };

  // Filter out dismissed suggestions
  const visibleSuggestions = suggestions.filter(
    sugg => !dismissedFriends[sugg.id]
  );

  return {
    suggestions: visibleSuggestions,
    loading,
    handleDismiss
  };
}
