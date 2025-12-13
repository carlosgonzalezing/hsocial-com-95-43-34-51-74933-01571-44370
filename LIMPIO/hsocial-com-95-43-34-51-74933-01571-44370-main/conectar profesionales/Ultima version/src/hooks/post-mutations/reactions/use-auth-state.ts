
import React from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for managing authentication state related to reactions
 */
export function useAuthState() {
  const [sessionChecked, setSessionChecked] = React.useState(false);
  const [hasValidSession, setHasValidSession] = React.useState(false);

  // Check session on component mount
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session:", error);
          setHasValidSession(false);
        } else {
          setHasValidSession(!!data.session);
        }
        setSessionChecked(true);
      } catch (error) {
        console.error("Error checking session:", error);
        setHasValidSession(false);
        setSessionChecked(true);
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasValidSession(!!session);
      setSessionChecked(true);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    sessionChecked,
    hasValidSession,
    setSessionChecked,
    setHasValidSession
  };
}
