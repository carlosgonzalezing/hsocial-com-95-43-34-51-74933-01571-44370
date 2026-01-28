import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  updated_at: string;
  visibility: string;
  post_type: string;
  username: string;
  avatar_url: string | null;
}

export function useRealtimeFeed(userId?: string) {
  const queryClient = useQueryClient();

  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ["feed", "realtime"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:profiles(username, avatar_url)
        `)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Post[];
    },
    staleTime: 1000, // 1 segundo
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  useEffect(() => {
    if (!userId) return;

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel("feed-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: "visibility=eq.public",
        },
        (payload) => {
          console.log("Feed change:", payload);
          
          // Refrescar inmediatamente cuando hay cambios
          queryClient.invalidateQueries({ queryKey: ["feed", "realtime"] });
          queryClient.refetchQueries({ queryKey: ["feed", "realtime"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["feed", "realtime"] });
    queryClient.refetchQueries({ queryKey: ["feed", "realtime"] });
  };

  return {
    posts,
    isLoading,
    error,
    refetch: forceRefresh,
  };
}
