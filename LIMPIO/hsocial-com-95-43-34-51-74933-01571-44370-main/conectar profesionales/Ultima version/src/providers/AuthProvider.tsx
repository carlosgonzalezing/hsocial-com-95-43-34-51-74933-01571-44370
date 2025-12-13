
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Setting up auth listener...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AuthProvider: Auth event:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle profile creation for new users
        if (event === 'SIGNED_IN' && session?.user) {
          // Immediate profile creation for OAuth users
          setTimeout(async () => {
            try {
              await ensureProfileExists(session.user);
            } catch (error) {
              console.error('Error in post-signin tasks:', error);
            }
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('🔐 AuthProvider: Error getting session:', error);
        setLoading(false);
        return;
      }
      
      console.log('🔐 AuthProvider: Initial session check:', { hasSession: !!session, userEmail: session?.user?.email });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const ensureProfileExists = async (user: User) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        const username = user.user_metadata?.name || 
                        user.user_metadata?.full_name || 
                        user.email?.split('@')[0] || 
                        'Usuario';
        
        await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            username: username,
            career: user.user_metadata?.career || null,
            semester: user.user_metadata?.semester || null,
            birth_date: user.user_metadata?.birth_date || null
          }]);
        
        console.log('✅ Profile created for user:', user.email);
      }
    } catch (error) {
      console.error('❌ Error ensuring profile exists:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!session && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
