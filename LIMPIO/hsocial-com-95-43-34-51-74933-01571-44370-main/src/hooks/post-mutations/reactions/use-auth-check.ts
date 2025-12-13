
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for checking authentication before allowing reactions
 */
export function useAuthCheck(sessionChecked: boolean, hasValidSession: boolean, setHasValidSession: (value: boolean) => void) {
  const { toast } = useToast();

  // Check if user is authenticated
  const checkAuth = useCallback(async (showToast = true) => {
    // If we've already checked and user is authenticated, return true
    if (sessionChecked && hasValidSession) {
      return true;
    }
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session validation error:", error);
        setHasValidSession(false);
        if (showToast) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error al verificar la sesión",
          });
        }
        return false;
      }
      
      const isAuthenticated = !!data.session;
      setHasValidSession(isAuthenticated);
      
      if (!isAuthenticated && showToast) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
      }
      
      return isAuthenticated;
    } catch (err) {
      console.error("Error validating session:", err);
      setHasValidSession(false);
      if (showToast) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al verificar la sesión",
        });
      }
      return false;
    }
  }, [sessionChecked, hasValidSession, setHasValidSession, toast]);

  return { checkAuth };
}
