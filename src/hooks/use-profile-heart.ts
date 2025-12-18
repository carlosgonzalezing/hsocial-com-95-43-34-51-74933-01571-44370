// Stub hook - profile_hearts and engagement_hearts tables removed
import { useState } from "react";

export function useProfileHeart(profileId: string) {
  const [hasGivenHeart] = useState(false);
  const [heartsCount] = useState(0);
  const [isLoading] = useState(false);

  const toggleHeart = async () => {
    console.log('Profile hearts feature disabled');
  };

  return { 
    hasGivenHeart, 
    heartsCount, 
    isLoading, 
    toggleHeart 
  };
}
