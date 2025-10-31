
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useFriends } from "@/hooks/use-friends";
import { FriendSuggestionsList } from "@/components/friends/FriendSuggestionsList";
import { AllFriendsList } from "@/components/friends/AllFriendsList";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SentRequest {
  id: string;
  friend: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  status: string;
}

export default function Friends() {
  const { user } = useAuth();
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const { friends, following, followers, suggestions, loading, followUser, unfollowUser } = useFriends(user?.id || null);

  useEffect(() => {
    if (user?.id) {
      loadSentRequests();
    }
  }, [user?.id]);

  const loadSentRequests = async () => {
    if (!user?.id) return;

    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('id, friend_id, status')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (error) return;
    
    const requests = await Promise.all((friendships || []).map(async (f) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', f.friend_id)
        .single();
      
      return {
        id: f.id,
        status: f.status,
        friend: {
          id: profile?.id || f.friend_id,
          username: profile?.username || '',
          avatar_url: profile?.avatar_url || ''
        }
      };
    }));
    
    setSentRequests(requests);
  };

  const handleCancelRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId);

    if (!error) {
      await loadSentRequests();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex bg-muted/30">
        <Navigation />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Debes iniciar sesión para ver esta página.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto p-6">
        <Tabs defaultValue="suggestions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="following">Siguiendo</TabsTrigger>
            <TabsTrigger value="followers">Seguidores</TabsTrigger>
            <TabsTrigger value="suggestions">Sugerencias</TabsTrigger>
            <TabsTrigger value="all">Amigos</TabsTrigger>
            <TabsTrigger value="sent">Enviadas</TabsTrigger>
          </TabsList>

          <TabsContent value="following">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Usuarios que sigues</h2>
              {following.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No sigues a ningún usuario todavía
                </p>
              ) : (
                <div className="space-y-4">
                  {following.map((user) => (
                    <div key={user.friend_id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.friend_avatar_url || undefined} />
                          <AvatarFallback>
                            {user.friend_username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.friend_username}</div>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => unfollowUser(user.friend_id)}
                      >
                        Dejar de seguir
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="followers">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Usuarios que te siguen</h2>
              {followers.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Nadie te sigue todavía
                </p>
              ) : (
                <div className="space-y-4">
                  {followers.map((user) => (
                    <div key={user.friend_id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.friend_avatar_url || undefined} />
                          <AvatarFallback>
                            {user.friend_username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.friend_username}</div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => followUser(user.friend_id)}
                      >
                        Seguir de vuelta
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="suggestions">
            <FriendSuggestionsList 
              suggestions={suggestions}
            />
          </TabsContent>

          <TabsContent value="all">
            <AllFriendsList friends={friends} />
          </TabsContent>

          <TabsContent value="sent">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Solicitudes enviadas</h2>
              {sentRequests.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No has enviado ninguna solicitud de amistad
                </p>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.friend.avatar_url || undefined} />
                          <AvatarFallback>
                            {request.friend.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.friend.username}</div>
                          <div className="text-sm text-muted-foreground">Pendiente</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        Cancelar solicitud
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
