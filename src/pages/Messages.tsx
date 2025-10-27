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
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
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
        const conversationsData = friendsData.map(friend => ({
          id: friend.friend_id,
          username: friend.username,
          avatar_url: friend.avatar_url,
          lastMessage: '',
          lastMessageTime: '',
          unreadCount: 0
        }));

        setConversations(conversationsData);

        // If there's a selected user in URL, find and select that conversation
        if (selectedUserId) {
          const selected = conversationsData.find(conv => conv.id === selectedUserId);
          if (selected) {
            setSelectedConversation(selected);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading friends:', error);
        setLoading(false);
      }
    };

    loadFriends();
  }, [user?.id, selectedUserId]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation && user?.id) {
      const friend = friends.find(f => f.friend_id === selectedConversation.id);
      if (friend) {
        loadMessages(user.id, friend);
      }
    }
  }, [selectedConversation, user?.id, friends, loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id) return;

    const friend = friends.find(f => f.friend_id === selectedConversation.id);
    if (!friend) return;

    try {
      await sendMessage(newMessage, user.id, friend);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Mensajes
              {conversations.length > 0 && (
                <Badge variant="secondary">{conversations.length}</Badge>
              )}
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tienes conversaciones aún</p>
                  <p className="text-xs mt-1">Agrega amigos para comenzar a chatear</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conversation) => (
                    <Button
                      key={conversation.id}
                      variant={selectedConversation?.id === conversation.id ? "default" : "ghost"}
                      className="w-full justify-start p-3 h-auto"
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={conversation.avatar_url} />
                        <AvatarFallback>
                          {conversation.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium truncate">{conversation.username}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.lastMessage || 'Iniciar conversación'}
                        </p>
                      </div>
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConversation.avatar_url} />
                    <AvatarFallback>
                      {selectedConversation.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.username}</h3>
                    <p className="text-xs text-muted-foreground">En línea</p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="p-0 flex flex-col h-[500px]">
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay mensajes aún</p>
                      <p className="text-xs mt-1">¡Envía el primer mensaje!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full text-center">
              <div>
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
                <p className="text-muted-foreground">
                  Elige un amigo de la lista para comenzar a chatear
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}