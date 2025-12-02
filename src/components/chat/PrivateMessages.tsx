import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  contenido: string;
  created_at: string;
  id_autor: string;
  author: {
    username: string;
    avatar_url: string;
  };
}

interface Conversation {
  id: string; // user_id del otro usuario
  username: string;
  avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  channel_id: string;
}

export function PrivateMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Obtener usuario actual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Obtener o crear canal privado entre dos usuarios
  const getOrCreatePrivateChannel = async (userId1: string, userId2: string): Promise<string | null> => {
    try {
      // Buscar canal existente entre estos dos usuarios
      // Primero obtener todos los canales privados donde el usuario 1 es miembro
      const { data: user1Channels, error: searchError } = await supabase
        .from("miembros_canal")
        .select(`
          id_canal,
          canales!inner(id, es_privado)
        `)
        .eq("id_usuario", userId1)
        .eq("canales.es_privado", true);

      if (searchError) throw searchError;

      // Verificar si alguno de estos canales tiene a ambos usuarios como miembros
      if (user1Channels && user1Channels.length > 0) {
        for (const memberChannel of user1Channels) {
          const channelId = memberChannel.id_canal;
          const { data: members } = await supabase
            .from("miembros_canal")
            .select("id_usuario")
            .eq("id_canal", channelId);

          if (members && members.length === 2) {
            const memberIds = members.map((m: any) => m.id_usuario);
            if (memberIds.includes(userId1) && memberIds.includes(userId2)) {
              return channelId;
            }
          }
        }
      }

      // Crear nuevo canal privado
      const { data: newChannel, error: createError } = await supabase
        .from("canales")
        .insert({
          nombre: `Chat privado`,
          es_privado: true
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!newChannel) return null;

      // Agregar ambos usuarios como miembros
      await supabase.from("miembros_canal").insert([
        { id_canal: newChannel.id, id_usuario: userId1 },
        { id_canal: newChannel.id, id_usuario: userId2 }
      ]);

      return newChannel.id;
    } catch (error) {
      console.error("Error getting/creating private channel:", error);
      return null;
    }
  };

  // Cargar conversaciones
  const loadConversations = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);

      // Obtener todos los canales privados donde el usuario es miembro
      const { data: userChannels, error: channelsError } = await supabase
        .from("miembros_canal")
        .select(`
          id_canal,
          canales!inner(id, es_privado, nombre)
        `)
        .eq("id_usuario", currentUserId)
        .eq("canales.es_privado", true);

      if (channelsError) throw channelsError;

      // Ya están filtrados por es_privado = true
      const privateChannels = userChannels || [];

      // Para cada canal privado, obtener el otro miembro y el último mensaje
      const conversationsData = await Promise.all(
        privateChannels.map(async (memberChannel: any) => {
          const channelId = memberChannel.id_canal;

          // Obtener el otro miembro del canal
          const { data: otherMembers, error: membersError } = await supabase
            .from("miembros_canal")
            .select("id_usuario")
            .eq("id_canal", channelId)
            .neq("id_usuario", currentUserId);

          if (membersError || !otherMembers || otherMembers.length === 0) return null;

          const otherUserId = otherMembers[0].id_usuario;

          // Obtener perfil del otro usuario
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", otherUserId)
            .single();

          if (profileError || !profile) return null;

          // Obtener último mensaje del canal
          const { data: lastMessage, error: messageError } = await supabase
            .from("mensajes")
            .select("id, contenido, created_at")
            .eq("id_canal", channelId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Contar mensajes no leídos (simplificado - asumimos que todos están leídos por ahora)
          const unreadCount = 0;

          return {
            id: otherUserId,
            username: profile.username || "Usuario",
            avatar_url: profile.avatar_url,
            last_message: lastMessage?.contenido || "Inicia una conversación",
            last_message_at: lastMessage?.created_at || new Date().toISOString(),
            unread_count: unreadCount,
            channel_id: channelId
          };
        })
      );

      // Filtrar nulls y ordenar por último mensaje
      const validConversations = conversationsData
        .filter(Boolean) as Conversation[];
      
      validConversations.sort((a, b) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );

      setConversations(validConversations);

      // Si hay un parámetro ?user= en la URL, abrir esa conversación
      const userIdParam = searchParams.get("user");
      if (userIdParam && validConversations.find(c => c.id === userIdParam)) {
        setSelectedConversation(userIdParam);
      } else if (validConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(validConversations[0].id);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar mensajes de una conversación
  const loadMessages = async (channelId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from("mensajes")
        .select(`
          id,
          contenido,
          created_at,
          id_autor
        `)
        .eq("id_canal", channelId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Obtener IDs únicos de autores
      const authorIds = [...new Set(messagesData?.map(m => m.id_autor).filter(Boolean) || [])];
      
      // Obtener perfiles de los autores
      let profilesMap: Record<string, { username: string; avatar_url: string }> = {};
      if (authorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", authorIds);
        
        if (!profilesError && profiles) {
          profilesMap = profiles.reduce((acc, profile) => {
            acc[profile.id] = {
              username: profile.username || "Usuario",
              avatar_url: profile.avatar_url || ""
            };
            return acc;
          }, {} as Record<string, { username: string; avatar_url: string }>);
        }
      }

      // Combinar mensajes con sus autores
      const messagesWithAuthors = (messagesData || []).map(message => ({
        ...message,
        author: profilesMap[message.id_autor || ""] || { username: "Usuario", avatar_url: "" }
      }));

      setMessages(messagesWithAuthors as Message[]);
      
      // Scroll al final
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth"
        });
      }, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive",
      });
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || !selectedConversation || sending) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from("mensajes")
        .insert({
          contenido: newMessage.trim(),
          id_canal: conversation.channel_id,
          id_autor: currentUserId,
        });

      if (error) throw error;

      setNewMessage("");
      
      // Recargar mensajes
      await loadMessages(conversation.channel_id);
      
      // Recargar conversaciones para actualizar último mensaje
      await loadConversations();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Suscripción a nuevos mensajes en tiempo real
  useEffect(() => {
    if (!selectedConversation) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const channel = supabase
      .channel(`private-messages-${conversation.channel_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: `id_canal=eq.${conversation.channel_id}`,
        },
        () => {
          loadMessages(conversation.channel_id);
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, conversations]);

  // Cargar conversaciones cuando cambia el usuario actual
  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
  }, [currentUserId]);

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation) {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation) {
        loadMessages(conversation.channel_id);
      }
    }
  }, [selectedConversation, conversations]);

  // Manejar apertura de chat desde URL
  useEffect(() => {
    const userIdParam = searchParams.get("user");
    if (userIdParam && currentUserId && userIdParam !== currentUserId) {
      // Crear o obtener canal privado
      getOrCreatePrivateChannel(currentUserId, userIdParam).then((channelId) => {
        if (channelId) {
          // Recargar conversaciones para incluir la nueva
          loadConversations().then(() => {
            setSelectedConversation(userIdParam);
            // No limpiar el parámetro inmediatamente para mantener la selección
          });
        }
      });
    }
  }, [searchParams.get("user"), currentUserId]);

  // Filtrar conversaciones por búsqueda
  const filteredConversations = conversations.filter(conv =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] border border-border rounded-lg overflow-hidden bg-background">
      {/* Lista de conversaciones */}
      <div className="w-full md:w-80 border-r border-border flex flex-col">
        {/* Header con búsqueda */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-3">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Lista de conversaciones */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {searchQuery ? "No se encontraron conversaciones" : "No tienes conversaciones aún"}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={cn(
                    "w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left",
                    selectedConversation === conv.id && "bg-muted"
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.avatar_url || undefined} />
                    <AvatarFallback>
                      {conv.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">{conv.username}</p>
                      {conv.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.last_message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(conv.last_message_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col hidden md:flex">
        {selectedConv ? (
          <>
            {/* Header del chat */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConv.avatar_url || undefined} />
                <AvatarFallback>
                  {selectedConv.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedConv.username}</p>
                <p className="text-xs text-muted-foreground">En línea</p>
              </div>
            </div>

            {/* Mensajes */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Inicia una conversación con {selectedConv.username}</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.id_autor === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isOwn && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.author.avatar_url || undefined} />
                            <AvatarFallback>
                              {message.author.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn("max-w-[70%]", isOwn && "flex flex-col items-end")}>
                          {!isOwn && (
                            <p className="text-xs text-muted-foreground mb-1 px-2">
                              {message.author.username}
                            </p>
                          )}
                          <div
                            className={cn(
                              "rounded-lg px-4 py-2",
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.contenido}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 px-2">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </p>
                        </div>
                        {isOwn && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={undefined} />
                            <AvatarFallback>Tú</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Input de mensaje */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" disabled={sending || !newMessage.trim()}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Selecciona una conversación para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
