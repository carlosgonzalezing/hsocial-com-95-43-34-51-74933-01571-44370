
import { useState, useEffect } from "react";
import { Post, IdeaParticipant } from "@/types/post";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export function useJoinIdeaDialog(post: Post) {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [profession, setProfession] = useState("");
  const [isCurrentUserJoined, setIsCurrentUserJoined] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showJoinButton, setShowJoinButton] = useState(false);

  // Check if the post is an idea post
  const isIdeaPost = !!post.idea;

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isIdeaPost) {
        setShowJoinButton(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setShowJoinButton(false);
          return;
        }

        setCurrentUserId(user.id);

        // Get the participants from the idea
        let participants: (string | IdeaParticipant)[] = [];
        
        if (post.idea && Array.isArray(post.idea.participants)) {
          participants = post.idea.participants;
        }

        // Check if the user is already joined
        const userJoined = participants.some(p => {
          if (typeof p === 'string') {
            return p === user.id;
          }
          return p.user_id === user.id;
        });

        setIsCurrentUserJoined(userJoined);
        setShowJoinButton(!userJoined);

      } catch (error) {
        console.error("Error checking user join status:", error);
      }
    };

    checkUserStatus();
  }, [post.id, post.idea, isIdeaPost]);

  const handleJoinIdea = async () => {
    if (!profession.trim()) return;

    try {
      // Implementation would go here
      console.log("User joining idea with profession:", profession);
      
      // For now, just close the dialog
      setIsJoinDialogOpen(false);
      setProfession("");
    } catch (error) {
      console.error("Error joining idea:", error);
    }
  };

  const onJoinClick = () => {
    setIsJoinDialogOpen(true);
  };

  return {
    isJoinDialogOpen,
    setIsJoinDialogOpen,
    profession,
    setProfession,
    isCurrentUserJoined,
    currentUserId,
    handleJoinIdea,
    showJoinButton,
    onJoinClick
  };
}
