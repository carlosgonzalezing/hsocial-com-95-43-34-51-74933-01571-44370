import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePremium() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-premium"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("is_user_premium");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    isPremium: Boolean(data),
    isLoading,
    error,
  };
}
