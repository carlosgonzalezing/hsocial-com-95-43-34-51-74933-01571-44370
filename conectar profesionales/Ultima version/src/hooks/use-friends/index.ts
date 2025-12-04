
import { useState, useEffect } from "react";
import { useFriendData } from "./use-friend-data";
import { useFriendActions } from "./use-friend-actions";
import { Friend, FriendRequest, FriendSuggestion } from "./types";

// Re-export types
export type { Friend, FriendRequest, FriendSuggestion };

export function useFriends(currentUserId: string | null) {
  const { 
    friends, 
    following, 
    followers, 
    pendingRequests, 
    sentRequests, 
    suggestions, 
    loading,
    loadFriends,
    loadFriendRequests,
    loadSuggestions
  } = useFriendData(currentUserId);

  // Define a function to update all data
  const updateAllData = async () => {
    await Promise.all([
      loadFriends(),
      loadFriendRequests(),
      loadSuggestions()
    ]);
  };

  const { 
    followUser, 
    unfollowUser, 
    handleFriendRequest, 
    cancelSentRequest 
  } = useFriendActions(currentUserId, updateAllData);

  const dismissSuggestion = (userId: string) => {
    // This is a client-side only action, no need to call API
    setSuggestions(prev => prev.filter(s => s.id !== userId));
  };

  // Local state for temporary suggestion dismissal  
  const [suggestionsState, setSuggestions] = useState<FriendSuggestion[]>(suggestions);

useEffect(() => {
  setSuggestions(suggestions);
}, [suggestions]);

  return {
    friends,         // Usuarios que siguen mutuamente (amigos)
    following,       // Usuarios que el usuario actual sigue
    followers,       // Usuarios que siguen al usuario actual
    pendingRequests, // Solicitudes de amistad pendientes
    sentRequests,    // Solicitudes de amistad enviadas
    suggestions: suggestionsState, // Sugerencias de amistad
    loading,
    followUser,      // Enviar solicitud de amistad
    unfollowUser,    // Dejar de seguir
    handleFriendRequest, // Aceptar/rechazar solicitud
    cancelSentRequest, // Cancelar solicitud enviada
    dismissSuggestion, // Descartar sugerencia
  };
}
