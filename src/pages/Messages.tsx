import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { usePrivateMessages } from '@/hooks/use-private-messages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, ArrowLeft, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Friend } from '@/hooks/use-friends/types';

interface Conversation {
  id: string;
  username: string;
  avatar_url?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get('user');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { 
    messages, 
    loadMessages, 
    sendMessage,
    deleteMessage 
  } = usePrivateMessages(user?.id);

  // Load friends on component mount
  useEffect(() => {
    if (!user?.id) return;

    const loadFriends = async () => {
      try {
        const { data, error } = await supabase
          .from('friendships')
          .select(`
            id,
            friend_id,
            profiles!friendships_friend_id_fkey (
              id,
              username,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'accepted');

        if (error) throw error;

        const friendsData: Friend[] = data?.map(item => ({
          id: item.id,
          friend_id: item.friend_id,
          username: item.profiles?.username || 'Usuario',
          avatar_url: item.profiles?.avatar_url,
          friend_username: item.profiles?.username || 'Usuario',
          friend_avatar_url: item.profiles?.avatar_url
        })) || [];

        setFriends(friendsData);

        // Create conversations from friends
        const conversationsData = friendsData.map((friend, index) => ({
          id: friend.friend_id,
          username: friend.username,
          avatar_url: friend.avatar_url,
          lastMessage: index === 0 ? '¿Cuándo empezamos el proyecto?' : index === 1 ? 'Me encanta la idea!' : 'Revisé el código, está perfecto',
          lastMessageTime: index === 0 ? 'Hace 10 min' : index === 1 ? 'Hace 1 hora' : 'Hace 3 horas',
          unreadCount: index === 0 ? 2 : index === 2 ? 1 : 0
        }));

        setConversations(conversationsData);

        setLoading(false);
      } catch (error) {
        console.error('Error loading friends:', error);
        setLoading(false);
      }
    };

    loadFriends();
  }, [user?.id]);

  const filteredConversations = conversations.filter(conv => 
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return 'Ahora';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  const handleConversationClick = (conversation: Conversation) => {
    // Navegar a la conversación completa
    navigate(`/messages?user=${conversation.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Search Bar */}
      <div className="sticky top-0 bg-background z-10 p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar mensajes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-none"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="divide-y">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tienes conversaciones aún</p>
            <p className="text-xs mt-1">Agrega amigos para comenzar a chatear</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleConversationClick(conversation)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-14 w-14">
                <AvatarImage src={conversation.avatar_url} />
                <AvatarFallback>
                  {conversation.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm truncate">{conversation.username}</p>
                  {conversation.lastMessageTime && (
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {conversation.lastMessageTime}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage || 'Iniciar conversación'}
                  </p>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <Badge variant="default" className="ml-2 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-[#0095f6]">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}