
import { supabase } from "@/integrations/supabase/client";

export async function getHiddenPosts() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("hidden_posts")
      .select("post_id")
      .eq("user_id", user.id);

    if (error) throw error;
    return data.map(item => item.post_id);
  } catch (error) {
    console.error("Error fetching hidden posts:", error);
    return [];
  }
}

export async function hidePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const { error } = await supabase
      .from("hidden_posts")
      .insert({ user_id: user.id, post_id: postId });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error hiding post:", error);
    throw error;
  }
}

export async function unhidePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const { error } = await supabase
      .from("hidden_posts")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error unhiding post:", error);
    throw error;
  }
}
