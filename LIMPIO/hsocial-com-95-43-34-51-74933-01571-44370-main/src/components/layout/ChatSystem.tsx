import { useState, useEffect } from "react";
import { MessageCircle, X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useChatSystem } from "@/hooks/use-chat-system";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export function ChatSystem() {
  const { chatWindows, closeChat, toggleMinimize } = useChatSystem();
  const [showChatList, setShowChatList] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [newMessages, setNewMessages] = useState<Record<string, string>>({});

  // Load recent conversations
  useEffect(() => {
    // Load real conversations from API when needed
    // For now, start with empty state - chats will be opened explicitly by user
  }, []);

  const handleCloseChat = (userId: string) => {
    closeChat(userId);
    setMessages(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
    setNewMessages(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  const sendMessage = (userId: string) => {
    const message = newMessages[userId];
    if (!message?.trim()) return;

    // Here you would typically send the message via your API
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender_id: "current-user", // Replace with actual current user ID
      created_at: new Date().toISOString()
    };

    setMessages(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), newMessage]
    }));

    setNewMessages(prev => ({
      ...prev,
      [userId]: ""
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, userId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(userId);
    }
  };

  return (
    <>
      {/* Chat Windows */}
      <div className="fixed bottom-0 right-4 z-40 flex gap-2">
        {chatWindows.map((chat, index) => (
          <Card 
            key={chat.id}
            className={cn(
              "w-[320px] bg-card border border-border shadow-lg transition-all duration-200",
              chat.isMinimized ? "h-12" : "h-[400px]"
            )}
            style={{
              marginRight: `${index * 10}px`
            }}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center space-x-2 flex-1 cursor-pointer" onClick={() => toggleMinimize(chat.id)}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chat.avatar_url || undefined} />
                  <AvatarFallback>
                    {chat.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{chat.username}</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Activo</span>
                  </div>
                </div>
                {chat.unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleMinimize(chat.id)}
                  className="h-6 w-6 p-0"
                >
                  {chat.isMinimized ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleCloseChat(chat.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!chat.isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar h-[300px]">
                  <div className="space-y-2">
                    {(messages[chat.id] || []).map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.sender_id === "current-user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                            message.sender_id === "current-user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    
                    {messages[chat.id]?.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Inicia una conversación con {chat.username}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-border">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={newMessages[chat.id] || ""}
                      onChange={(e) => setNewMessages(prev => ({
                        ...prev,
                        [chat.id]: e.target.value
                      }))}
                      onKeyPress={(e) => handleKeyPress(e, chat.id)}
                      className="flex-1 h-8 text-sm"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => sendMessage(chat.id)}
                      disabled={!newMessages[chat.id]?.trim()}
                      className="h-8 px-3"
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Floating chat button removed for cleaner UI */}
    </>
  );
}
