import { supabase } from "@/integrations/supabase/client";

export async function getMutualFriends(userId1: string, userId2: string): Promise<number> {
  try {
    // Get friends of user1
    const { data: user1Friends, error: error1 } = await supabase
      .from("friendships")
      .select("friend_id")
      .eq("user_id", userId1)
      .eq("status", "accepted");

    if (error1) throw error1;

    // Get friends of user2
    const { data: user2Friends, error: error2 } = await supabase
      .from("friendships")
      .select("friend_id")
      .eq("user_id", userId2)
      .eq("status", "accepted");

    if (error2) throw error2;

    const user1FriendIds = new Set(user1Friends?.map((f) => f.friend_id) || []);
    const user2FriendIds = new Set(user2Friends?.map((f) => f.friend_id) || []);

    // Count mutual friends
    let mutualCount = 0;
    user1FriendIds.forEach((id) => {
      if (user2FriendIds.has(id)) {
        mutualCount++;
      }
    });

    return mutualCount;
  } catch (error) {
    console.error("Error getting mutual friends:", error);
    return 0;
  }
}
