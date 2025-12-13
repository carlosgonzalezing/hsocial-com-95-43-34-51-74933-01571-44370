
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useReactionAuth() {
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuthStatus();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!!session) {
        setAuthError(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
      setAuthError(null);
    };
  }, []);

  // Validate user session
  const validateSession = useCallback(async () => {
    // First check the cached state for better UX
    if (isAuthenticated === false) {
      setAuthError("Debes iniciar sesión para reaccionar");
      return null;
    }
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session validation error:", error);
        setAuthError("Error al verificar la sesión");
        setIsAuthenticated(false);
        return null;
      }
      
      if (!data.session?.user) {
        setAuthError("Debes iniciar sesión para reaccionar");
        setIsAuthenticated(false);
        return null;
      }
      
      setIsAuthenticated(true);
      return data.session.user;
    } catch (err) {
      console.error("Error validating session:", err);
      setAuthError("Error al verificar la sesión");
      setIsAuthenticated(false);
      return null;
    }
  }, [isAuthenticated]);

  return {
    authError,
    isAuthenticated,
    validateSession,
    setAuthError
  };
}
