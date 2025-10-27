import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const STORY_DURATION = 5000; // 5 seconds per story

export function useStoryViewer(
  storyId: string,
  allStories: any[],
  onNavigate: (storyId: string) => void,
  onClose: () => void
) {
  const { user } = useAuth();
  const [currentStory, setCurrentStory] = useState<any>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch story data
  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true);
      const { data: storyData, error } = await supabase
        .from("stories")
        .select("id, user_id, image_url, media_type, created_at")
        .eq("id", storyId)
        .single();

      if (error) {
        console.error("Error fetching story:", error);
        return;
      }

      // Get profile separately
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", storyData.user_id)
        .single();

      // Record view
      if (user) {
        await supabase.from("story_views").upsert({
          story_id: storyId,
          viewer_id: user.id,
          viewed_at: new Date().toISOString(),
        }, { onConflict: "story_id,viewer_id" });
      }

      const timeAgo = Date.now() - new Date(storyData.created_at).getTime();
      const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
      const minutesAgo = Math.floor((timeAgo % (1000 * 60 * 60)) / (1000 * 60));

      setCurrentStory({
        ...storyData,
        username: profile?.username || "Usuario",
        avatar_url: profile?.avatar_url,
        time_ago: hoursAgo > 0 ? `Hace ${hoursAgo}h` : `Hace ${minutesAgo}m`,
        media_items: [
          {
            url: storyData.image_url,
            type: storyData.media_type || "image",
          },
        ],
      });
      setIsLoading(false);
    };

    fetchStory();
  }, [storyId, user]);

  // Progress timer
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, currentStory, currentMediaIndex]);

  const handleNext = useCallback(() => {
    if (currentMediaIndex < (currentStory?.media_items?.length || 1) - 1) {
      setCurrentMediaIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Go to next user's story
      const currentIndex = allStories.findIndex((s) => s.id === storyId);
      if (currentIndex < allStories.length - 1) {
        onNavigate(allStories[currentIndex + 1].id);
      } else {
        onClose();
      }
    }
  }, [currentMediaIndex, currentStory, storyId, allStories, onNavigate, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      const currentIndex = allStories.findIndex((s) => s.id === storyId);
      if (currentIndex > 0) {
        onNavigate(allStories[currentIndex - 1].id);
      }
    }
  }, [currentMediaIndex, storyId, allStories, onNavigate]);

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  const handleReaction = async () => {
    if (!user || !currentStory) return;

    await supabase.from("story_reactions").upsert({
      story_id: currentStory.id,
      user_id: user.id,
      reaction_type: "love",
    }, { onConflict: "story_id,user_id" });
  };

  return {
    currentStory,
    currentMediaIndex,
    progress,
    isPaused,
    isLoading,
    handleNext,
    handlePrevious,
    handlePause,
    handleResume,
    handleReaction,
  };
}
