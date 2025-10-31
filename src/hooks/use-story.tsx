// Stub hook - stories and story_views tables removed
import { useState } from "react";

interface StoryMedia {
  url: string;
  type: 'image' | 'video';
}

interface StoryData {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  mediaItems: StoryMedia[];
  createdAt: string;
}

export function useStory(storyId: string) {
  const [isLoading] = useState(false);
  
  const storyData: StoryData = {
    id: storyId,
    user: {
      id: `user${storyId}`,
      username: "Stories deshabilitadas",
      avatarUrl: null
    },
    mediaItems: [{
      url: "https://via.placeholder.com/800x1200?text=Stories+disabled",
      type: 'image'
    }],
    createdAt: new Date().toISOString()
  };

  return {
    storyData,
    isLoading,
    timeDisplay: "Stories deshabilitadas"
  };
}
