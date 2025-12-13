
import { useState, useCallback } from "react";
import { Friend, FriendRequest, FriendSuggestion } from "../types";

export function useFriendState() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [following, setFollowing] = useState<Friend[]>([]);
  const [followers, setFollowers] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const updateFriendsState = useCallback((mutualFriends: Friend[], onlyFollowing: Friend[], onlyFollowers: Friend[]) => {
    setFriends(mutualFriends);
    setFollowing([...mutualFriends, ...onlyFollowing]);
    setFollowers([...mutualFriends, ...onlyFollowers]);
  }, []);

  const updateRequestsState = useCallback((pending: FriendRequest[], sent: FriendRequest[]) => {
    setPendingRequests(pending);
    setSentRequests(sent);
  }, []);

  const updateSuggestionsState = useCallback((newSuggestions: FriendSuggestion[]) => {
    setSuggestions(newSuggestions);
  }, []);

  return {
    // State
    friends,
    following,
    followers,
    pendingRequests,
    sentRequests,
    suggestions,
    loading,
    setLoading,
    
    // State updaters
    updateFriendsState,
    updateRequestsState,
    updateSuggestionsState
  };
}
