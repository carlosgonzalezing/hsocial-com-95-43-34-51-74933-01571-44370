
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useProfileHeart(profileId: string) {
  const [hasGivenHeart, setHasGivenHeart] = useState(false);
  const [heartsCount, setHeartsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user ID
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    
    getCurrentUser();
  }, []);

  // Load initial heart data
  useEffect(() => {
    const loadHeartData = async () => {
      if (!profileId) return;
      
      try {
        setIsLoading(true);
        
        // Get total hearts count from profile_hearts
        const { count, error: countError } = await supabase
          .from('profile_hearts')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId);
          
        if (countError) throw countError;
        const profileHeartsCount = count || 0;

        // Get engagement hearts sum for this user (earned via activity)
        const { data: engagementData, error: engagementError } = await supabase
          .from('engagement_hearts')
          .select('hearts_received')
          .eq('user_id', profileId);
        
        if (engagementError) throw engagementError;
        const engagementSum = (engagementData || []).reduce((sum, row) => sum + (row.hearts_received || 0), 0);
        
        // Combined total hearts shown on profile
        setHeartsCount(profileHeartsCount + engagementSum);
        
        // Check if current user has given heart
        if (currentUserId) {
          const { data, error } = await supabase
            .from('profile_hearts')
            .select('id')
            .eq('profile_id', profileId)
            .eq('giver_id', currentUserId);
            
          if (error) throw error;
          setHasGivenHeart(data && data.length > 0);
        }
      } catch (error) {
        console.error('Error loading profile heart data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHeartData();
    
    // Set up real-time subscriptions for heart changes (profile + engagement)
    const profileChannel = supabase
      .channel('profile_hearts_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profile_hearts',
        filter: `profile_id=eq.${profileId}` 
      }, () => {
        loadHeartData();
      })
      .subscribe();

    const engagementChannel = supabase
      .channel('engagement_hearts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'engagement_hearts',
        filter: `user_id=eq.${profileId}`
      }, () => {
        loadHeartData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(engagementChannel);
    };
  }, [profileId, currentUserId]);

  // Toggle heart function
  const toggleHeart = async () => {
    if (!currentUserId || !profileId || isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (hasGivenHeart) {
        // Remove heart
        const { error } = await supabase
          .from('profile_hearts')
          .delete()
          .eq('profile_id', profileId)
          .eq('giver_id', currentUserId);
          
        if (error) throw error;
        setHasGivenHeart(false);
        setHeartsCount(prev => Math.max(0, prev - 1));
      } else {
        // Add heart
        const { error } = await supabase
          .from('profile_hearts')
          .insert({ 
            profile_id: profileId, 
            giver_id: currentUserId 
          });
          
        if (error) throw error;
        setHasGivenHeart(true);
        setHeartsCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling profile heart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { hasGivenHeart, heartsCount, isLoading, toggleHeart };
}
