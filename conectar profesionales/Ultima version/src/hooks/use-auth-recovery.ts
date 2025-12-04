import { useEffect, useState } from 'react';
import { verifyAuthState, cleanupAuthState } from '@/utils/auth-cleanup';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to handle authentication recovery and cleanup
 */
export function useAuthRecovery() {
  const [isRecovering, setIsRecovering] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuthState = async () => {
      try {
        setIsRecovering(true);
        const isValid = await verifyAuthState();
        
        if (mounted) {
          setIsAuthenticated(isValid);
        }
      } catch (error) {
        console.error('Auth recovery error:', error);
        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsRecovering(false);
        }
      }
    };

    // Initial check
    checkAuthState();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, !!session);
        
        if (mounted) {
          if (event === 'SIGNED_OUT') {
            setIsAuthenticated(false);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setIsAuthenticated(!!session);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthError = async () => {
    try {
      setIsRecovering(true);
      await cleanupAuthState();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to handle auth error:', error);
    } finally {
      setIsRecovering(false);
    }
  };

  return {
    isRecovering,
    isAuthenticated,
    handleAuthError
  };
}