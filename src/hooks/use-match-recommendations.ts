// Hook deshabilitado - tabla match_actions eliminada
export function useMatchRecommendations(currentUserId: string | null) {
  return {
    currentProfile: null,
    handleLike: async () => {},
    handlePass: async () => {},
    handleSuperLike: async () => {},
    loading: false
  };
}
