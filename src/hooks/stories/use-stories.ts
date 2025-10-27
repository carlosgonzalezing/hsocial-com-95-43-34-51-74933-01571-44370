import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface Story {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  has_viewed: boolean;
  story_count: number;
}

export function useStories() {
  const { user } = useAuth();

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["stories", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all stories from last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: storiesData, error } = await supabase
        .from("stories")
        .select(`
          id,
          user_id,
          created_at,
          profiles!inner (
            username,
            avatar_url
          )
        `)
        .gte("created_at", twentyFourHoursAgo)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching stories:", error);
        return [];
      }

      // Get viewed stories
      const { data: viewedStories } = await supabase
        .from("story_views")
        .select("story_id")
        .eq("viewer_id", user.id);

      const viewedStoryIds = new Set(viewedStories?.map((v) => v.story_id) || []);

      // Group by user
      const storiesByUser = storiesData.reduce((acc, story: any) => {
        const userId = story.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            username: story.profiles.username,
            avatar_url: story.profiles.avatar_url,
            stories: [],
          };
        }
        acc[userId].stories.push({
          id: story.id,
          has_viewed: viewedStoryIds.has(story.id),
        });
        return acc;
      }, {} as Record<string, any>);

      // Convert to array and sort (unviewed first)
      const result: Story[] = Object.values(storiesByUser).map((user: any) => ({
        id: user.stories[0].id, // First story ID for navigation
        user_id: user.user_id,
        username: user.username,
        avatar_url: user.avatar_url,
        has_viewed: user.stories.every((s: any) => s.has_viewed),
        story_count: user.stories.length,
      }));

      return result.sort((a, b) => {
        if (a.has_viewed === b.has_viewed) return 0;
        return a.has_viewed ? 1 : -1;
      });
    },
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    stories,
    isLoading,
  };
}
