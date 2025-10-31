import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  UserPlus, 
  MessageCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
// Removed engagement sidebar
import { useChatSystem } from "@/hooks/use-chat-system";

interface RightSidebarProps {
  currentUserId: string | null;
}

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  is_online?: boolean;
  last_seen?: string;
}

interface FriendSuggestion {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends?: number;
}

export function RightSidebar({ currentUserId }: RightSidebarProps) {
  const { openChat } = useChatSystem();
  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
  const [friendSuggestions, setFriendSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Load online friends and suggestions
  useEffect(() => {
    if (!currentUserId) return;

    const loadSidebarData = async () => {
      try {
        // Load friendships
        const { data: friendships, error: friendsError } = await supabase
          .from('friendships')
          .select('id, user_id, friend_id, status')
          .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
          .eq('status', 'accepted')
          .limit(8);

        if (friendsError) throw friendsError;

        // Fetch profiles separately
        const friends = await Promise.all((friendships || []).map(async (friendship) => {
          const friendUserId = friendship.user_id === currentUserId ? friendship.friend_id : friendship.user_id;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', friendUserId)
            .single();

          if (!profile) return null;

          return {
            id: profile.id,
            username: profile.username || '',
            avatar_url: profile.avatar_url,
            is_online: Math.random() > 0.5,
            last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString()
          };
        }));

        setOnlineFriends(friends.filter(Boolean) as Friend[]);

        // Load friend suggestions (users not yet friends with)
        const { data: suggestionsData, error: suggestionsError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .neq('id', currentUserId)
          .limit(5);

        if (suggestionsError) throw suggestionsError;

        // Filter out existing friends
        const existingFriendIds = friends.map(f => f.id);
        const suggestions = suggestionsData
          ?.filter(profile => !existingFriendIds.includes(profile.id))
          .map(profile => ({
            ...profile,
            mutual_friends: Math.floor(Math.random() * 10) // Simulate mutual friends count
          })) || [];

        setFriendSuggestions(suggestions);
      } catch (error) {
        console.error('Error loading sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSidebarData();
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="h-full bg-background border-l border-border p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="h-4 bg-muted rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background border-l border-border p-4 overflow-y-auto custom-scrollbar">
      {/* Engagement Tracker */}
      <div className="mb-6">
        {/* Engagement sidebar removed for performance */}
      </div>

      {/* Online Friends */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Contactos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {onlineFriends.length > 0 ? (
            onlineFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>
                      {friend.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  {friend.is_online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => openChat(friend.id, friend.username, friend.avatar_url)}
                >
                  <p className="text-sm font-medium truncate">{friend.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {friend.is_online ? 'Activo ahora' : 'Hace un momento'}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/profile/${friend.id}`}
                    className="p-1 rounded hover:bg-muted/70 transition-colors"
                    title="Ver perfil"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tienes amigos conectados
            </p>
          )}
        </CardContent>
      </Card>

      {/* Friend Suggestions */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Personas que podrías conocer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {friendSuggestions.length > 0 ? (
            friendSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="space-y-2">
                <Link
                  to={`/profile/${suggestion.id}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={suggestion.avatar_url || undefined} />
                    <AvatarFallback>
                      {suggestion.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{suggestion.username}</p>
                    {suggestion.mutual_friends && suggestion.mutual_friends > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {suggestion.mutual_friends} amigos en común
                      </p>
                    )}
                  </div>
                </Link>
                <div className="flex gap-2 px-2">
                  <Button size="sm" className="flex-1 h-7 text-xs">
                    Agregar
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1 h-7 text-xs">
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay sugerencias disponibles
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}