import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UniversityFriendSuggestion {
  id: string;
  username: string;
  avatar_url: string | null;
  career: string | null;
  semester: string | null;
  institution_name: string | null;
  relevance_score: number;
  connection_reason: string;
}

export function useUniversitySuggestions(currentUserId: string | null) {
  const [suggestions, setSuggestions] = useState<UniversityFriendSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSuggestions = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_university_friend_suggestions', {
        user_id_param: currentUserId,
        limit_param: 20
      });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error loading university suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [currentUserId]);

  return {
    suggestions,
    loading,
    refetch: loadSuggestions
  };
}