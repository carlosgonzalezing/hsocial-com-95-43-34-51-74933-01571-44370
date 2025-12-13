
import { useEffect } from "react";
import { useSubscriptionManager } from "@/hooks/use-subscription-manager";

export function useIdeaSubscriptions(postId: string) {
  const { getOrCreateChannel, removeChannel } = useSubscriptionManager();

  useEffect(() => {
    if (!postId) return;

    const ideaParticipantsChannelName = `idea_participants_${postId}`;
    const postsChannelName = `posts_idea_updates_${postId}`;

    // Set up idea participants channel
    const ideaParticipantsPromise = getOrCreateChannel(ideaParticipantsChannelName, (channel) => {
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'idea_participants',
        filter: `post_id=eq.${postId}`
      }, () => {
        console.log("Cambio detectado en idea_participants");
      });
    });

    // Set up posts channel
    const postsPromise = getOrCreateChannel(postsChannelName, (channel) => {
      channel.on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts',
        filter: `id=eq.${postId}`
      }, () => {
        console.log("Cambio detectado en posts (idea)");
      });
    });

    // Handle subscription errors
    ideaParticipantsPromise?.catch((error) => {
      console.error(`Failed to subscribe to idea participants channel:`, error);
    });

    postsPromise?.catch((error) => {
      console.error(`Failed to subscribe to posts channel:`, error);
    });

    return () => {
      removeChannel(ideaParticipantsChannelName);
      removeChannel(postsChannelName);
    };
  }, [postId, getOrCreateChannel, removeChannel]);
}
