
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

function clearSupabaseAuthStorage() {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (/^sb-.*-auth-token$/.test(key)) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Best-effort
  }
}

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
  const presenceIntervalRef = useRef<number | null>(null);
  const userIdRef = useRef<string | null>(null);
  const debug = import.meta.env.DEV;

  const buildProfilePayload = (u: User) => {
    const username =
      u.user_metadata?.name ||
      u.user_metadata?.full_name ||
      u.email?.split('@')[0] ||
      'Usuario';

    return {
      id: u.id,
      username,
      career: u.user_metadata?.career || null,
      semester: u.user_metadata?.semester || null,
      birth_date: u.user_metadata?.birth_date || null,
      account_type: u.user_metadata?.account_type || 'person',
      person_status: u.user_metadata?.person_status || null,
      updated_at: new Date().toISOString(),
    };
  };

  useEffect(() => {
    if (debug) console.log('🔐 AuthProvider: Setting up auth listener...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (debug) console.log('🔐 AuthProvider: Auth event:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        userIdRef.current = session?.user?.id ?? null;
        
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

        if (event === 'SIGNED_OUT') {
          try {
            const prevUserId = userIdRef.current;
            if (prevUserId) {
              await (supabase as any)
                .from('profiles')
                .upsert(
                  {
                    id: prevUserId,
                    status: 'offline',
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: 'id' }
                );
            }
            userIdRef.current = null;
          } catch {
            // Best-effort
          }
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        if (debug) console.error('🔐 AuthProvider: Error getting session:', error);

        const message = (error as any)?.message as string | undefined;
        if (message && message.toLowerCase().includes('invalid refresh token')) {
          clearSupabaseAuthStorage();
          void supabase.auth.signOut();
          window.location.href = '/auth';
          return;
        }

        setLoading(false);
        return;
      }
      
      if (debug) console.log('🔐 AuthProvider: Initial session check:', { hasSession: !!session, userEmail: session?.user?.email });
      setSession(session);
      setUser(session?.user ?? null);
      userIdRef.current = session?.user?.id ?? null;
      setLoading(false);
    });

    return () => {
      if (debug) console.log('🔐 AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    let isCancelled = false;

    const setPresence = async (status: 'online' | 'away' | 'offline') => {
      try {
        const now = new Date().toISOString();
        await ensureProfileExists(user);
        await (supabase as any)
          .from('profiles')
          .upsert(
            {
              id: user.id,
              status,
              last_seen: now,
              updated_at: now,
            },
            { onConflict: 'id' }
          );
      } catch {
        // Best-effort
      }
    };

    const syncPresence = async () => {
      if (isCancelled) return;
      const status: 'online' | 'away' = document.visibilityState === 'hidden' ? 'away' : 'online';
      await setPresence(status);
    };

    const handleVisibility = () => {
      void syncPresence();
    };

    const handleBeforeUnload = () => {
      void setPresence('offline');
    };

    void setPresence('online');

    presenceIntervalRef.current = window.setInterval(() => {
      void syncPresence();
    }, 60_000);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isCancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (presenceIntervalRef.current) {
        window.clearInterval(presenceIntervalRef.current);
        presenceIntervalRef.current = null;
      }
      void setPresence('offline');
    };
  }, [user?.id]);

  const ensureProfileExists = async (user: User) => {
    try {
      const computed = buildProfilePayload(user);
      const googleName =
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        null;

      const { data: existing, error: existingError } = await (supabase as any)
        .from('profiles')
        .select('id, name_manually_edited')
        .eq('id', user.id)
        .maybeSingle();

      if (existingError) throw existingError;

      const payload = (existing as any)?.name_manually_edited
        ? {
            id: computed.id,
            career: computed.career,
            semester: computed.semester,
            birth_date: computed.birth_date,
            account_type: computed.account_type,
            person_status: computed.person_status,
            google_name: googleName,
            updated_at: computed.updated_at,
          }
        : {
            ...computed,
            google_name: googleName,
          };

      await (supabase as any)
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });
    } catch (error) {
      if (debug) console.error('❌ Error ensuring profile exists:', error);
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
