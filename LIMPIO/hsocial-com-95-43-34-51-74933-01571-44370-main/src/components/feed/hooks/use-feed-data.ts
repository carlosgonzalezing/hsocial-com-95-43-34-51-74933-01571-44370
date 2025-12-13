
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getPosts, getHiddenPosts } from "@/lib/api";
import { transformPoll } from "../utils/transform-poll";
import { supabase } from "@/integrations/supabase/client";
import type { Post, Idea } from "@/types/post";

export function useFeedData(userId?: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const showNew = searchParams.get("new") === "true";
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [hiddenUserIds, setHiddenUserIds] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  // Get hidden posts
  useEffect(() => {
    const getHiddenData = async () => {
      try {
        // Get hidden posts
        const hiddenPostsIds = await getHiddenPosts();
        setHiddenPostIds(hiddenPostsIds);
        
        // Get hidden users
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: hiddenUsers } = await (supabase as any)
            .from('hidden_users')
            .select('hidden_user_id')
            .eq('user_id', user.id);
          
          if (hiddenUsers && Array.isArray(hiddenUsers)) {
            setHiddenUserIds(hiddenUsers.map((h: any) => h.hidden_user_id));
          }
        }
      } catch (error) {
        console.error("Error fetching hidden data:", error);
      }
    };
    
    getHiddenData();
  }, []);

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => getPosts(userId),
    select: (data: any[]) => {
      // Transform the raw post data into properly typed Post objects
      let transformedPosts = data.map(post => {
        const postWithTypes: Post = {
          id: post.id,
          content: post.content,
          author_id: post.author_id,
          user_id: post.user_id,
          created_at: post.created_at,
          updated_at: post.updated_at,
          media_url: post.media_url,
          media_type: post.media_type,
          reactions: post.reactions || [],
          reactions_count: post.reactions_count || 0,
          comments_count: post.comments_count || 0,
          userHasReacted: post.userHasReacted || false,
          poll: transformPoll(post.poll),
          idea: post.idea as Idea | undefined,
          visibility: post.visibility as "public" | "friends" | "private" | "incognito",
          user_reaction: post.user_reaction,
          // Handle optional properties that might cause type errors
          shared_post: post.shared_post as Post | undefined,
          shared_post_id: post.shared_post_id as string | undefined,
          shared_from: post.shared_from as string | undefined,
          profiles: post.profiles ? {
            id: post.profiles.id || post.user_id || '',
            username: post.profiles.username || '',
            avatar_url: post.profiles.avatar_url || ''
          } : undefined
        };

        return postWithTypes;
      });

      transformedPosts = transformedPosts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (showNew) {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        transformedPosts = transformedPosts
          .filter(post => {
            const postDate = new Date(post.created_at);
            return postDate > twentyFourHoursAgo;
          });
      }

      return transformedPosts;
    }
  });

  useEffect(() => {
    if (showNew) {
      refetch().then(() => {
        setSearchParams({});
      });
    }
  }, [showNew, refetch, setSearchParams]);

  const visiblePosts = showHidden 
    ? posts 
    : posts.filter(post => 
        !hiddenPostIds.includes(post.id) && 
        !hiddenUserIds.includes(post.user_id || '')
      );
  
  const hiddenPosts = posts.filter(post => 
    hiddenPostIds.includes(post.id) || 
    hiddenUserIds.includes(post.user_id || '')
  );

  const toggleHiddenPosts = () => setShowHidden(!showHidden);

  return {
    visiblePosts,
    hiddenPosts,
    showHidden,
    toggleHiddenPosts,
    isLoading
  };
}
