// src/components/Navigation.tsx

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Users } from 'lucide-react';

// Main Navigation Component
const Navigation = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Array<{ id: string; username: string; avatar_url: string | null }>>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Manejador de selección seguro (para mitigar IndexSizeError de extensiones)
  useEffect(() => {
    const handleSelectionChange = () => {
      try {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          // Acceder al rango para prevenir el error
          selection.rangeCount > 0 && selection.getRangeAt(0);
        }
      } catch (e) {
        // Ignorar errores de selección
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange, { passive: true });
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    const loadFriends = async () => {
      if (!currentUserId) return;
      setLoading(true);
      try {
        const { data: accepted, error: acceptedError } = await supabase
          .from('friendships')
          .select('user_id, friend_id')
          .eq('status', 'accepted')
          .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

        if (acceptedError) throw acceptedError;

        const friendIds = Array.from(new Set((accepted || []).map((r: any) =>
          r.user_id === currentUserId ? r.friend_id : r.user_id
        ))).filter(Boolean);

        if (friendIds.length === 0) {
          setFriends([]);
        } else {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', friendIds);

          if (profilesError) throw profilesError;
          setFriends((profiles || []).map((p: any) => ({
            id: p.id,
            username: p.username || 'Usuario',
            avatar_url: p.avatar_url ?? null,
          })));
        }

        const { count } = await supabase
          .from('friendships')
          .select('id', { count: 'exact', head: true })
          .eq('friend_id', currentUserId)
          .eq('status', 'pending');

        setPendingCount(count || 0);
      } catch {
        setFriends([]);
        setPendingCount(0);
      } finally {
        setLoading(false);
      }
    };
    loadFriends();
  }, [currentUserId]);

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => (a.username || '').localeCompare(b.username || ''));
  }, [friends]);

  return (
    <FullScreenPageLayout title="Amigos">
      <div className="container px-2 sm:px-4 max-w-4xl pt-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Mis amigos</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/friends/requests')}>
            Solicitudes{pendingCount > 0 ? ` (${pendingCount})` : ''}
          </Button>
        </div>

        <Card className="p-4">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Cargando amigos...</div>
          ) : sortedFriends.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">Aún no tienes amigos</div>
          ) : (
            <div className="divide-y">
              {sortedFriends.map((f) => (
                <Link
                  key={f.id}
                  to={`/profile/${f.id}`}
                  className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-accent/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={f.avatar_url || undefined} />
                    <AvatarFallback>{(f.username || 'U')[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{f.username}</div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </FullScreenPageLayout>
  );
};

// **SOLAMENTE EXPORTACIÓN POR DEFECTO**
export default Navigation;