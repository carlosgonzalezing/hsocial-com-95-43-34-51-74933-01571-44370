import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAuthRedirect() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle auth state changes (including OAuth redirects)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          // Check if this is an OAuth signin
          const provider = session.user?.app_metadata?.provider;
          
          if (provider === 'google') {
            toast({
              title: "¡Bienvenido!",
              description: "Has iniciado sesión correctamente con Google.",
            });
            
            // For OAuth, redirect immediately to avoid loops
            navigate('/', { replace: true });
          } else if (window.location.pathname === '/auth') {
            // For regular auth, only redirect if on auth page
            navigate('/', { replace: true });
          }
        } else if (event === 'SIGNED_OUT') {
          // Only redirect if we're not already on auth page
          if (window.location.pathname !== '/auth') {
            navigate('/auth', { replace: true });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return {};
}