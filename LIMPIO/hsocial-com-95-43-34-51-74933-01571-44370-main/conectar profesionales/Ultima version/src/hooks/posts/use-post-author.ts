
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if the current user is the author of a post
 */
export function usePostAuthor(postUserId: string, setIsCurrentUserAuthor: (value: boolean) => void) {
  useEffect(() => {
    const checkAuthor = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        setIsCurrentUserAuthor(data.user.id === postUserId);
      }
    };
    
    checkAuthor();
  }, [postUserId, setIsCurrentUserAuthor]);
}
