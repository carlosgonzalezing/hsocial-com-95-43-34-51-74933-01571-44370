
import { useState, useCallback } from "react";
import { 
  getFriends,
  getFollowers,
  getPendingFriendRequests,
  getSentFriendRequests,
  getFriendSuggestions
} from "@/lib/api/friends";
import { Friend, FriendRequest, FriendSuggestion } from "../types";

export function useFriendFetch(currentUserId: string | null) {
  const [loading, setLoading] = useState(true);
  
  const fetchFriends = useCallback(async () => {
    if (!currentUserId) {
      console.log('No user ID available for fetching friends');
      return { mutualFriends: [], onlyFollowing: [], onlyFollowers: [] };
    }

    try {
      console.log('Fetching friends for user:', currentUserId);
      const friendsData = await getFriends();
      const followersData = await getFollowers();
      
      // Identificamos amigos mutuos
      const followerIds = new Set(followersData.map(f => f.friend_id));
      const mutualFriends = friendsData.filter(f => followerIds.has(f.friend_id))
        .map(f => ({
          ...f,
          status: 'friends' as const
        }));
      
      // Usuarios que sigo pero no me siguen
      const onlyFollowing = friendsData.filter(f => !followerIds.has(f.friend_id))
        .map(f => ({
          ...f,
          status: 'following' as const
        }));
      
      // Usuarios que me siguen pero no sigo
      const onlyFollowers = followersData.filter(f => !friendsData.some(fr => fr.friend_id === f.friend_id))
        .map(f => ({
          ...f,
          status: 'follower' as const
        }));
      
      return { mutualFriends, onlyFollowing, onlyFollowers };
    } catch (error) {
      console.error("Error loading friends:", error);
      return { mutualFriends: [], onlyFollowing: [], onlyFollowers: [] };
    }
  }, [currentUserId]);

  const fetchFriendRequests = useCallback(async () => {
    if (!currentUserId) return { pendingRequests: [], sentRequests: [] };

    try {
      const pendingRequests = await getPendingFriendRequests();
      const sentRequests = await getSentFriendRequests();
      
      return { pendingRequests, sentRequests };
    } catch (error) {
      console.error("Error loading friend requests:", error);
      return { pendingRequests: [], sentRequests: [] };
    }
  }, [currentUserId]);

  const fetchSuggestions = useCallback(async () => {
    if (!currentUserId) {
      console.log('No user ID available for fetching suggestions');
      return [];
    }

    try {
      console.log('Fetching suggestions for user:', currentUserId);
      const suggestionsData = await getFriendSuggestions();
      return suggestionsData;
    } catch (error) {
      console.error("Error loading suggestions:", error);
      return [];
    }
  }, [currentUserId]);

  return {
    fetchFriends,
    fetchFriendRequests,
    fetchSuggestions,
    setLoading
  };
}
