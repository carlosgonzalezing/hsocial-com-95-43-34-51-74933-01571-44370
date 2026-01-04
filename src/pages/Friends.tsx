import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePeopleSuggestions } from "@/hooks/use-people-suggestions";
import { getFollowers, getFollowing, type Follower, type Following } from "@/lib/api/followers";
import { useBatchFollowingStatus } from "@/hooks/use-batch-following-status";
import { FollowButton } from "@/components/FollowButton";

export default function Friends() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("suggestions");
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [loadingFollowData, setLoadingFollowData] = useState(true);

  const { suggestions, loading: loadingSuggestions } = usePeopleSuggestions();

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    const loadFollowData = async () => {
      if (!currentUserId) return;
      setLoadingFollowData(true);
      try {
        const [followersData, followingData] = await Promise.all([
          getFollowers(currentUserId),
          getFollowing(currentUserId)
        ]);
        setFollowers(followersData);
        setFollowing(followingData);
      } finally {
        setLoadingFollowData(false);
      }
    };

    loadFollowData();
  }, [currentUserId]);

  const followerIds = followers.map(f => f.id);
  const followingIds = following.map(f => f.id);
  const suggestionIds = suggestions.map(s => s.id);
  const allUserIds = Array.from(new Set([...followerIds, ...followingIds, ...suggestionIds]));

  const {
    getFollowingStatus,
    updateFollowingStatus,
    isLoading: batchLoading
  } = useBatchFollowingStatus(allUserIds);

  const isLoading = loadingSuggestions || loadingFollowData || batchLoading;

  return (
    <FullScreenPageLayout title="Mi red">
      <div className="container px-2 sm:px-4 max-w-4xl pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full grid grid-cols-3">
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Sugerencias</span>
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Seguidores</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Siguiendo</span>
            </TabsTrigger>
          </TabsList>

          <Card className="overflow-hidden">
            <TabsContent value="suggestions" className="m-0">
              {isLoading ? (
                <div className="p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Cargando sugerencias...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <UserPlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No hay sugerencias por ahora</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Vuelve más tarde para ver nuevas sugerencias
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {suggestions.map((s) => (
                    <div key={s.id} className="p-4 flex items-center justify-between gap-3">
                      <Link to={`/profile/${s.id}`} className="flex items-center space-x-3 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={s.avatar_url || undefined} />
                          <AvatarFallback>
                            {s.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{s.username}</p>
                        </div>
                      </Link>
                      <FollowButton
                        targetUserId={s.id}
                        size="sm"
                        batchFollowingStatus={getFollowingStatus(s.id)}
                        onBatchFollowingUpdate={updateFollowingStatus}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="followers" className="m-0">
              {isLoading ? (
                <div className="p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Cargando seguidores...</p>
                </div>
              ) : followers.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No tienes seguidores todavía</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Cuando otros usuarios te sigan, aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {followers.map((f) => (
                    <div key={f.id} className="p-4 flex items-center justify-between gap-3">
                      <Link to={`/profile/${f.id}`} className="flex items-center space-x-3 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={f.avatar_url || undefined} />
                          <AvatarFallback>
                            {f.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{f.username}</p>
                        </div>
                      </Link>
                      <FollowButton
                        targetUserId={f.id}
                        size="sm"
                        batchFollowingStatus={getFollowingStatus(f.id)}
                        onBatchFollowingUpdate={updateFollowingStatus}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="following" className="m-0">
              {isLoading ? (
                <div className="p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Cargando seguidos...</p>
                </div>
              ) : following.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <UserPlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No sigues a nadie todavía</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Encuentra personas interesantes para seguir
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {following.map((f) => (
                    <div key={f.id} className="p-4 flex items-center justify-between gap-3">
                      <Link to={`/profile/${f.id}`} className="flex items-center space-x-3 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={f.avatar_url || undefined} />
                          <AvatarFallback>
                            {f.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{f.username}</p>
                        </div>
                      </Link>
                      <FollowButton
                        targetUserId={f.id}
                        size="sm"
                        batchFollowingStatus={getFollowingStatus(f.id)}
                        onBatchFollowingUpdate={updateFollowingStatus}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </FullScreenPageLayout>
  );
}