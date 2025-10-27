import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const queryClient = useQueryClient();
  
  const { data: storyData, isLoading } = useQuery({
    queryKey: ["story", storyId, Date.now()], // Add timestamp to force refresh
    queryFn: async () => {
      console.log('🔄 Fetching story data for:', storyId);
      
      // First get the story
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('id, image_url, created_at, user_id, media_type')
        .eq('id', storyId)
        .single();
        
      if (storyError) {
        console.error('❌ Error fetching story:', storyError);
        throw storyError;
      }
      
      console.log('✅ Story data fetched:', story);
      
      // Then get the user profile separately
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', story.user_id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }
      
      // Check if the current user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      // Record the view if a user is logged in
      if (user) {
        const { error: viewError } = await supabase
          .from('story_views')
          .upsert({
            story_id: storyId,
            viewer_id: user.id,
            viewed_at: new Date().toISOString()
          }, { onConflict: 'story_id,viewer_id' });
          
        if (viewError) {
          console.error("Error recording story view:", viewError);
        } else {
          // Invalidate stories query to update the UI with the new viewed status
          queryClient.invalidateQueries({ queryKey: ["stories"] });
          queryClient.invalidateQueries({ queryKey: ["viewed-stories", user.id] });
          queryClient.invalidateQueries({ queryKey: ["user-stories"] });
          console.log('✅ Story view recorded and cache invalidated');
        }
      }
      
      // Get all stories from this user to enable navigation
      const { data: userStories, error: userStoriesError } = await supabase
        .from('stories')
        .select('id, image_url, media_type')
        .eq('user_id', story.user_id)
        .order('created_at', { ascending: true });
        
      if (userStoriesError) {
        console.error("Error fetching user stories:", userStoriesError);
      }
      
      // Map user stories to media items
      const allMediaItems = userStories?.map(s => ({
        url: s.image_url,
        type: (s.media_type || 'image') as 'image' | 'video'
      })) || [{
        url: story.image_url,
        type: (story.media_type || 'image') as 'image' | 'video'
      }];
      
      const result = {
        id: story.id,
        user: {
          id: story.user_id,
          username: profile?.username || "Usuario",
          avatarUrl: profile?.avatar_url
        },
        mediaItems: allMediaItems,
        createdAt: story.created_at
      };
      
      console.log('📊 Final story data prepared:', result);
      return result;
    },
    staleTime: 0, // Always consider data stale
    gcTime: 1000 * 60, // Keep in cache for 1 minute only
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Create a placeholder while loading
  const displayData = storyData || {
    id: storyId,
    user: {
      id: `user${storyId}`,
      username: "Cargando...",
      avatarUrl: null
    },
    mediaItems: [{
      url: "https://via.placeholder.com/800x1200?text=Cargando...",
      type: 'image' as 'image' | 'video'
    }],
    createdAt: new Date().toISOString()
  };

  // Calculate time ago
  const timeAgo = new Date().getTime() - new Date(displayData.createdAt).getTime();
  const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
  const minutesAgo = Math.floor((timeAgo % (1000 * 60 * 60)) / (1000 * 60));
  
  const timeDisplay = hoursAgo > 0 
    ? `Hace ${hoursAgo}h ${minutesAgo}m` 
    : `Hace ${minutesAgo}m`;

  return {
    storyData: displayData,
    isLoading,
    timeDisplay
  };
}