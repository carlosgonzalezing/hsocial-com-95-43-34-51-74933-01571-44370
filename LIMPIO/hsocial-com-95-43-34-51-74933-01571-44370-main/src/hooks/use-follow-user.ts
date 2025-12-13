import { useState, useCallback } from 'react';
import { followUser as followUserApi, unfollowUser as unfollowUserApi, isFollowing as isFollowingApi } from '@/lib/api/followers/follow-actions';

export function useFollowUser() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});

  const updateLoading = useCallback((userId: string, loading: boolean) => {
    setIsLoading(prev => ({
      ...prev,
      [userId]: loading
    }));
  }, []);

  const followUser = useCallback(async (userId: string) => {
    updateLoading(userId, true);
    try {
      const result = await followUserApi(userId);
      if (result) {
        setFollowStatus(prev => ({
          ...prev,
          [userId]: true
        }));
      }
      return { success: !!result };
    } catch (error) {
      console.error('Error in followUser hook:', error);
      return { success: false, error };
    } finally {
      updateLoading(userId, false);
    }
  }, [updateLoading]);

  const unfollowUser = useCallback(async (userId: string) => {
    updateLoading(userId, true);
    try {
      const result = await unfollowUserApi(userId);
      if (result) {
        setFollowStatus(prev => ({
          ...prev,
          [userId]: false
        }));
      }
      return { success: !!result };
    } catch (error) {
      console.error('Error in unfollowUser hook:', error);
      return { success: false, error };
    } finally {
      updateLoading(userId, false);
    }
  }, [updateLoading]);

  const checkIsFollowing = useCallback(async (userId: string) => {
    try {
      const isFollowing = await isFollowingApi(userId);
      setFollowStatus(prev => ({
        ...prev,
        [userId]: isFollowing
      }));
      return isFollowing;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }, []);

  const getIsLoading = useCallback((userId: string) => {
    return !!isLoading[userId];
  }, [isLoading]);

  return {
    followUser,
    unfollowUser,
    isFollowing: checkIsFollowing,
    followStatus,
    isLoading: getIsLoading
  };
}
