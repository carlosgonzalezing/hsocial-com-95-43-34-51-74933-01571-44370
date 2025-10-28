import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StoryCircle } from "./StoryCircle";
import { useStories } from "@/hooks/stories/use-stories";
import { useState, useEffect } from "react";
import { StoryViewer } from "./StoryViewer";
import { StoryCreator } from "./StoryCreator";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function StoriesBar() {
  const { user } = useAuth();
  const { stories, isLoading } = useStories();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<{ avatar_url: string | null; username: string } | null>(
    null,
  );

  // Fetch current user profile
  useEffect(() => {
    if (!user?.id) {
      setCurrentUserProfile(null);
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("avatar_url, username").eq("id", user.id).single();

      if (data) {
        setCurrentUserProfile(data);
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="w-full border-b bg-card">
        <div className="flex gap-3 overflow-x-auto py-4 px-4 scrollbar-hide">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full border-b border-border bg-background">
        <ScrollArea className="w-full">
          {/* CORRECCIÓN CLAVE: py-2 cambiado a py-1 para reducir el espacio vertical */}
          <div className="flex gap-3 py-1 px-3">
            {/* Create Story Button - Always visible */}
            {user && currentUserProfile && (
              <StoryCircle
                isCreate
                onClick={() => setShowCreator(true)}
                currentUserAvatar={currentUserProfile.avatar_url}
                currentUsername={currentUserProfile.username}
              />
            )}

            {/* Story Circles */}
            {stories.map((story) => (
              <StoryCircle key={story.id} story={story} onClick={() => setSelectedStoryId(story.id)} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryId && (
        <StoryViewer
          storyId={selectedStoryId}
          allStories={stories}
          onClose={() => setSelectedStoryId(null)}
          onNavigate={setSelectedStoryId}
        />
      )}

      {/* Story Creator Modal */}
      <StoryCreator open={showCreator} onOpenChange={setShowCreator} />
    </>
  );
}
