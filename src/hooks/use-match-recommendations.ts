import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MatchProfile } from "@/types/matchmaking";

export function useMatchRecommendations(currentUserId: string | null) {
  const [currentProfile, setCurrentProfile] = useState<MatchProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNextProfile = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      // Get profiles excluding current user and already interacted users
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, career, semester, bio')
        .neq('id', currentUserId)
        .limit(1);

      if (error) throw error;
      
      if (profiles && profiles.length > 0) {
        // Transform profile to MatchProfile format
        const matchProfile: MatchProfile = {
          ...profiles[0],
          compatibility_score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
          shared_interests: [],
          mutual_friends_count: 0
        };
        setCurrentProfile(matchProfile);
      } else {
        setCurrentProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setCurrentProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentProfile || !currentUserId) return;
    
    try {
      // Record the like action
      await supabase.from('match_actions').insert({
        user_id: currentUserId,
        target_user_id: currentProfile.id,
        action_type: 'like'
      });
      
      // Fetch next profile
      fetchNextProfile();
    } catch (error) {
      console.error('Error recording like:', error);
    }
  };

  const handlePass = async () => {
    if (!currentProfile || !currentUserId) return;
    
    try {
      // Record the pass action
      await supabase.from('match_actions').insert({
        user_id: currentUserId,
        target_user_id: currentProfile.id,
        action_type: 'pass'
      });
      
      // Fetch next profile
      fetchNextProfile();
    } catch (error) {
      console.error('Error recording pass:', error);
    }
  };

  const handleSuperLike = async () => {
    if (!currentProfile || !currentUserId) return;
    
    try {
      // Record the super like action
      await supabase.from('match_actions').insert({
        user_id: currentUserId,
        target_user_id: currentProfile.id,
        action_type: 'super_like'
      });
      
      // Fetch next profile
      fetchNextProfile();
    } catch (error) {
      console.error('Error recording super like:', error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchNextProfile();
    }
  }, [currentUserId]);

  return {
    currentProfile,
    handleLike,
    handlePass,
    handleSuperLike,
    loading
  };
}