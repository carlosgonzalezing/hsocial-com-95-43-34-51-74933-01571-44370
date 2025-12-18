import React, { useState, useEffect } from "react";
import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCheck, Clock, AlertTriangle, Users, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SimpleFriendRequestsList } from "@/components/friends/SimpleFriendRequestsList";
import { useSimpleFriendRequests } from "@/hooks/use-friends/use-simple-friend-requests";
import { useFriends } from "@/hooks/use-friends";

const FriendRequestsPage = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("requests");
  const [authError, setAuthError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Auth error:', error);
          setAuthError('Error de autenticación. Por favor, inicia sesión nuevamente.');
          return;
        }
        if (user) {
          setCurrentUserId(user.id);
          setAuthError(null);
        } else {
          setAuthError('No hay usuario autenticado');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setAuthError('Error al cargar el usuario');
      }
    };
    loadCurrentUser();
  }, []);

  // Use simplified friend requests hook
  const {
    pendingRequests,
    sentRequests,
    loading: requestsLoading,
    actionLoading,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelRequest
  } = useSimpleFriendRequests(currentUserId);

  // Use original hook for friends and suggestions
  const {
    friends,
    suggestions,
    loading: friendsLoading,
    dismissSuggestion,
    followUser
  } = useFriends(currentUserId);

  const loading = requestsLoading || friendsLoading;

  // Handlers are now provided by the simplified hook

  // Simplified render functions using the new component

  const renderAllFriends = () => {
    if (loading) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Cargando amigos...</p>
        </div>
      );
    }

    if (!friends.length) {
      return (
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No tienes amigos todavía</h3>
          <p className="text-muted-foreground mt-1">
            Cuando aceptes solicitudes o te acepten, tus amigos aparecerán aquí
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {friends.map(friend => (
          <div key={friend.friend_id || friend.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={friend.friend_avatar_url || friend.avatar_url || undefined} />
                <AvatarFallback>
                  {(friend.friend_username || friend.username)?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="font-medium">
                  {friend.friend_username || friend.username || 'Usuario'}
                </span>
                {friend.mutual_friends_count && friend.mutual_friends_count > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {friend.mutual_friends_count} amigos en común
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSuggestions = () => {
    if (loading) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Cargando sugerencias...</p>
        </div>
      );
    }

    if (!suggestions.length) {
      return (
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No hay sugerencias disponibles</h3>
          <p className="text-muted-foreground mt-1">
            Vuelve más tarde para ver nuevas sugerencias de amistad
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {suggestions.map(suggestion => (
          <Card key={suggestion.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={suggestion.avatar_url || undefined} />
                  <AvatarFallback>
                    {suggestion.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium">
                    {suggestion.username || 'Usuario'}
                  </span>
                  {suggestion.mutual_friends_count > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {suggestion.mutual_friends_count} amigos en común
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    try {
                      await followUser(suggestion.id);
                      dismissSuggestion(suggestion.id);
                    } catch (error) {
                      console.error('Error sending friend request:', error);
                    }
                  }}
                  className="w-full"
                  size="sm"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Añadir
                </Button>
                <Button
                  onClick={() => dismissSuggestion(suggestion.id)}
                  variant="outline"
                  size="sm"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  if (authError) {
    return (
      <FullScreenPageLayout title="Solicitudes de amistad">
        <div className="container px-2 sm:px-4 max-w-4xl">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Error de autenticación</h3>
                <p className="text-sm text-muted-foreground mt-1">{authError}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Intentar de nuevo
              </Button>
            </div>
          </Card>
        </div>
      </FullScreenPageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <FullScreenPageLayout title="Solicitudes de amistad">
        <div className="container px-2 sm:px-4 max-w-4xl pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full overflow-x-auto scrollbar-hide flex whitespace-nowrap">
              <TabsTrigger value="requests" className="flex items-center">
                <UserCheck className="mr-2 h-4 w-4" />
                <span>Solicitudes</span>
                {pendingRequests.length > 0 && (
                  <Badge className="ml-2" variant="secondary">{pendingRequests.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>Enviadas</span>
                {sentRequests.length > 0 && (
                  <Badge className="ml-2" variant="secondary">{sentRequests.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>Mis amigos</span>
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Sugerencias</span>
              </TabsTrigger>
            </TabsList>
            
            <Card>
              <TabsContent value="requests" className="m-0">
                <SimpleFriendRequestsList
                  requests={pendingRequests}
                  type="pending"
                  loading={requestsLoading}
                  actionLoading={actionLoading}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                />
              </TabsContent>
              
              <TabsContent value="sent" className="m-0">
                <SimpleFriendRequestsList
                  requests={sentRequests}
                  type="sent"
                  loading={requestsLoading}
                  actionLoading={actionLoading}
                  onCancel={handleCancelRequest}
                />
              </TabsContent>

              <TabsContent value="friends" className="m-0">
                {renderAllFriends()}
              </TabsContent>
              
              <TabsContent value="suggestions" className="m-0">
                {renderSuggestions()}
              </TabsContent>
            </Card>
          </Tabs>
        </div>
      </FullScreenPageLayout>
    </ErrorBoundary>
  );
};

export default FriendRequestsPage;
