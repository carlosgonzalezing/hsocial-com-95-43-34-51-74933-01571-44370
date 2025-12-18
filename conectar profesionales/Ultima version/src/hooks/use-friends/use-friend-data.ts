
import { useEffect, useCallback } from "react";
import { useFriendFetch } from "./api/use-friend-fetch";
import { useFriendState } from "./api/use-friend-state";
import { useFriendSubscription } from "./api/use-friend-subscription";
import { Friend, FriendRequest, FriendSuggestion } from "./types";

/**
 * Ensures both naming conventions are present in a Friend object
 * for backward compatibility with components using either format
 */
const normalizeUserData = (user: Friend | any): Friend => {
  return {
    // Primary properties (new standard)
    id: user.id || user.friend_id,
    username: user.username || user.friend_username,
    avatar_url: user.avatar_url || user.friend_avatar_url,
    mutual_friends_count: user.mutual_friends_count,
    status: user.status,
    
    // Legacy properties (for compatibility)
    friend_id: user.friend_id || user.id,
    friend_username: user.friend_username || user.username,
    friend_avatar_url: user.friend_avatar_url || user.avatar_url
  };
};

export function useFriendData(currentUserId: string | null) {
  const {
    fetchFriends,
    fetchFriendRequests,
    fetchSuggestions,
    setLoading
  } = useFriendFetch(currentUserId);
  
  const {
    friends,
    following,
    followers,
    pendingRequests,
    sentRequests,
    suggestions,
    loading,
    updateFriendsState,
    updateRequestsState,
    updateSuggestionsState
  } = useFriendState();

  const loadFriends = useCallback(async () => {
    if (!currentUserId) return;
    
    const { mutualFriends, onlyFollowing, onlyFollowers } = await fetchFriends();
    
    // Normalize all data to ensure both naming patterns are included
    const normalizedMutualFriends = mutualFriends.map(normalizeUserData);
    const normalizedOnlyFollowing = onlyFollowing.map(normalizeUserData);
    const normalizedOnlyFollowers = onlyFollowers.map(normalizeUserData);
    
    updateFriendsState(normalizedMutualFriends, normalizedOnlyFollowing, normalizedOnlyFollowers);
  }, [currentUserId, fetchFriends, updateFriendsState]);

  const loadFriendRequests = useCallback(async () => {
    if (!currentUserId) return;
    
    const { pendingRequests, sentRequests } = await fetchFriendRequests();
    
    // No need to normalize requests as they don't use the dual naming pattern
    updateRequestsState(pendingRequests, sentRequests);
  }, [currentUserId, fetchFriendRequests, updateRequestsState]);

  const loadSuggestions = useCallback(async () => {
    if (!currentUserId) return;
    
    const suggestionsData = await fetchSuggestions();
    
    // No need to normalize suggestions as they don't use the dual naming pattern
    updateSuggestionsState(suggestionsData);
  }, [currentUserId, fetchSuggestions, updateSuggestionsState]);

  const updateAllData = useCallback(() => {
    loadFriends();
    loadFriendRequests();
    loadSuggestions();
  }, [loadFriends, loadFriendRequests, loadSuggestions]);

  // Setup real-time subscription
  useFriendSubscription(currentUserId, updateAllData);

  // Initial data load
  useEffect(() => {
    if (currentUserId) {
      setLoading(true);
      Promise.all([
        loadFriends(),
        loadFriendRequests(),
        loadSuggestions()
      ]).catch((error) => {
        console.error('Error loading friend data:', error);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [currentUserId, loadFriends, loadFriendRequests, loadSuggestions, setLoading]);

  return {
    friends,
    following,
    followers,
    pendingRequests,
    sentRequests,
    suggestions,
    loading,
    loadFriends,
    loadFriendRequests,
    loadSuggestions,
  };
}
