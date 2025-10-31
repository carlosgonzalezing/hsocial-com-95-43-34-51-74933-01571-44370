import { useState, useEffect } from "react";
import { MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useChatSystem } from "@/hooks/use-chat-system";
import { supabase } from "@/integrations/supabase/client";

interface RecentConversation {
  id: string;
  username: string;
  avatar_url: string | null;
  last_message: string;
  unread_count: number;
  updated_at: string;
}

interface MessageNotificationButtonProps {
  currentUserId?: string;
  className?: string;
}

export function MessageNotificationButton({ currentUserId, className }: MessageNotificationButtonProps) {
  const { openChat, getTotalUnreadCount } = useChatSystem();
  const [showConversations, setShowConversations] = useState(false);
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [loading, setLoading] = useState(false);

  const totalUnread = getTotalUnreadCount();

  const loadRecentConversations = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      // This is a simplified version - in a real app you'd have a proper messages table
      // For now, we'll load friends as potential conversations
      // Get friendships where user is involved
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, status')
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
        .eq('status', 'accepted')
        .limit(10);

      if (error) throw error;

      // Fetch profiles separately
      const conversations = await Promise.all((friendships || []).map(async (friendship) => {
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
          last_message: "Toca para iniciar conversación",
          unread_count: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
          updated_at: new Date().toISOString()
        };
      }));

      setRecentConversations(conversations.filter(Boolean) as RecentConversation[]);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConversations = () => {
    if (!showConversations && currentUserId) {
      loadRecentConversations();
    }
    setShowConversations(!showConversations);
  };

  const handleOpenChat = (conversation: RecentConversation) => {
    openChat(conversation.id, conversation.username, conversation.avatar_url);
    setShowConversations(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleConversations}
        className={cn(
          "relative flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-muted/50",
          className
        )}
        aria-label="Mensajes"
      >
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {totalUnread > 99 ? '99+' : totalUnread}
          </Badge>
        )}
      </Button>

      {/* Floating Conversations List */}
      {showConversations && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setShowConversations(false)}
          />
          
          {/* Conversations Panel */}
          <Card className="absolute top-12 right-0 w-80 max-h-96 z-40 shadow-lg border border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Conversaciones
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConversations(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="h-10 w-10 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentConversations.length > 0 ? (
                <div className="py-2">
                  {recentConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleOpenChat(conversation)}
                      className="flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.avatar_url || undefined} />
                          <AvatarFallback>
                            {conversation.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-primary-foreground font-medium">
                              {conversation.unread_count}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {conversation.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.last_message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay conversaciones recientes</p>
                </div>
              )}
            </div>

            <Separator />
            
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowConversations(false);
                  // Could navigate to full messages page if needed
                }}
                className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
              >
                <Users className="h-4 w-4 mr-2" />
                Ver chat grupal
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}