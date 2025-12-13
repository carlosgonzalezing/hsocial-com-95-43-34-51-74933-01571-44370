import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook optimizado para obtener el estado de seguimiento de múltiples usuarios
 * en una sola query en lugar de queries individuales
 */
export function useBatchFollowingStatus(userIds: string[]) {
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Memoizar userIds para evitar re-renders innecesarios
  const memoizedUserIds = useMemo(() => 
    userIds.filter(id => id && id !== currentUserId), 
    [userIds, currentUserId]
  );

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
      } catch (error) {
        console.error('Error getting current user:', error);
        setCurrentUserId(null);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchBatchFollowingStatus = async () => {
      if (!currentUserId || memoizedUserIds.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Query optimizado: 1 sola llamada para todos los usuarios
        const { data, error } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', currentUserId)
          .in('following_id', memoizedUserIds);

        if (error) throw error;

        // Crear mapa de following status
        const followingSet = new Set(data?.map(item => item.following_id) || []);
        
        const newFollowingMap: Record<string, boolean> = {};
        memoizedUserIds.forEach(userId => {
          newFollowingMap[userId] = followingSet.has(userId);
        });

        setFollowingMap(newFollowingMap);
      } catch (error) {
        console.error('Error fetching batch following status:', error);
        // En caso de error, marcar todos como false
        const errorMap: Record<string, boolean> = {};
        memoizedUserIds.forEach(userId => {
          errorMap[userId] = false;
        });
        setFollowingMap(errorMap);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchFollowingStatus();
  }, [currentUserId, memoizedUserIds]);

  const getFollowingStatus = (userId: string): boolean => {
    return followingMap[userId] || false;
  };

  const updateFollowingStatus = (userId: string, isFollowing: boolean) => {
    setFollowingMap(prev => ({
      ...prev,
      [userId]: isFollowing
    }));
  };

  return {
    getFollowingStatus,
    updateFollowingStatus,
    isLoading,
    currentUserId
  };
}