
import { useEffect } from "react";
import { useSubscriptionManager } from "@/hooks/use-subscription-manager";

export function useFriendSubscription(
  currentUserId: string | null,
  onUpdate: () => void
) {
  const { getOrCreateChannel, removeChannel } = useSubscriptionManager();

  useEffect(() => {
    if (!currentUserId) return;

    const channelName = `friend-changes-${currentUserId}`;
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 1000;

    const setupSubscription = async () => {
      try {
        const subscriptionPromise = getOrCreateChannel(channelName, (channel) => {
          channel
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'friendships',
              filter: `user_id=eq.${currentUserId}`
            }, () => {
              console.log('Friendship data changed (as sender), updating...');
              onUpdate();
            })
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'friendships',
              filter: `friend_id=eq.${currentUserId}`
            }, () => {
              console.log('Friendship data changed (as recipient), updating...');
              onUpdate();
            });
        });

        await subscriptionPromise;
        retryCount = 0; // Reset on success
      } catch (error) {
        console.error(`Failed to subscribe to channel ${channelName}:`, error);
        
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = baseDelay * Math.pow(2, retryCount - 1);
          console.log(`Retrying subscription in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
          setTimeout(setupSubscription, delay);
        } else {
          console.error('Max subscription retries reached, giving up');
        }
      }
    };

    setupSubscription();

    return () => {
      removeChannel(channelName);
    };
  }, [currentUserId, onUpdate, getOrCreateChannel, removeChannel]);
}
