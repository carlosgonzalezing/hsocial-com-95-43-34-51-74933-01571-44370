import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Edit, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Conversation {
  id: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async () => {
      setIsLoading(true);
      
      // Fetch friends as potential conversations
      const { data: friendships } = await supabase
        .from('friendships')
        .select('friend_id, user_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .limit(20);

      if (friendships) {
        const friendIds = friendships.map(f => 
          f.user_id === user.id ? f.friend_id : f.user_id
        );

        if (friendIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', friendIds);

          if (profiles) {
            const convs: Conversation[] = profiles.map(profile => ({
              id: profile.id,
              user: {
                id: profile.id,
                username: profile.username || 'Usuario',
                avatar_url: profile.avatar_url
              },
              lastMessage: 'Inicia una conversación',
              lastMessageTime: new Date().toISOString(),
              unread: false
            }));
            setConversations(convs);
          }
        }
      }
      
      setIsLoading(false);
    };

    fetchConversations();
  }, [user?.id]);

  const filteredConversations = conversations.filter(conv =>
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationClick = (userId: string) => {
    // Navigate to chat with this user or open chat modal
    navigate(`/profile/${userId}`);
  };

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'pt-14 pb-16' : 'pt-16'}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-14 md:top-16 z-10 bg-background border-b border-border">
          <div className="flex items-center justify-between p-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold flex-1">Mensajes</h1>
            <Button variant="ghost" size="icon">
              <Edit className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar mensajes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-0 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Cargando conversaciones...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No se encontraron conversaciones' : 'No tienes conversaciones aún'}
              </p>
              <Button onClick={() => navigate('/friends')}>
                Buscar amigos
              </Button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.user.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarImage src={conversation.user.avatar_url || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {conversation.user.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium truncate ${conversation.unread ? 'text-foreground' : 'text-foreground'}`}>
                      {conversation.user.username}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conversation.lastMessageTime), { 
                        addSuffix: false,
                        locale: es 
                      })}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${conversation.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {conversation.lastMessage}
                  </p>
                </div>

                {conversation.unread && (
                  <div className="h-3 w-3 rounded-full bg-primary shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
