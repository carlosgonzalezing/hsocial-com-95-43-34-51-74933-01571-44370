
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/hooks/use-notifications";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAcceptIdeaRequest, useRejectIdeaRequest } from "@/hooks/ideas/use-idea-requests";

const Notifications = () => {
  const { notifications, markAsRead, clearAllNotifications, removeNotification } = useNotifications();
  const [selectedTab, setSelectedTab] = useState("all");
  const navigate = useNavigate();
  const acceptIdeaRequest = useAcceptIdeaRequest();
  const rejectIdeaRequest = useRejectIdeaRequest();
  
  // Agrupar notificaciones por fecha
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = new Date(notification.created_at).toDateString();
    
    let group = "older";
    if (date === today) group = "today";
    else if (date === yesterday) group = "yesterday";
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(notification);
    
    return acc;
  }, { today: [], yesterday: [], older: [] });
  
  // Filtrar notificaciones según la pestaña seleccionada
  const getFilteredNotifications = () => {
    if (selectedTab === "unread") {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  };

  const handleIdeaRequest = async (notification: any, accept: boolean) => {
    try {
      if (!notification?.post_id || !notification?.sender?.id) return;

      const rawMessage: string = notification.message || '';
      const professionMatch = rawMessage.match(/Habilidad\/Profesión:\s*(.*)$/i);
      const profession = professionMatch?.[1]?.trim() || null;

      if (accept) {
        await acceptIdeaRequest.mutateAsync({
          postId: notification.post_id,
          userId: notification.sender.id,
          profession,
        });
      } else {
        await rejectIdeaRequest.mutateAsync({
          postId: notification.post_id,
          userId: notification.sender.id,
        });
      }

      markAsRead([notification.id]);
    } catch (e) {
      console.error('Error handling idea request:', e);
    }
  };

  const handleOpenChat = (senderId: string) => {
    navigate(`/messages?user=${senderId}`);
  };
  
  const filteredNotifications = getFilteredNotifications().filter(
    (n: any) => !['friend_request', 'friend_accepted'].includes(n.type)
  );
  const hasUnread = filteredNotifications.some((n: any) => !n.read);

  const handleNotificationClick = (notification: any) => {
    if (notification.post_id && notification.comment_id) {
      navigate(`/post/${notification.post_id}?comment=${notification.comment_id}`);
    } else if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    }
    
    if (!notification.read) {
      markAsRead([notification.id]);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 md:flex">
      <div className="hidden md:block">
        <Navigation />
      </div>
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Notificaciones</h1>
          <div className="flex gap-2">
            {hasUnread && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => markAsRead()}
              >
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">Marcar como leídas</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-destructive hover:text-destructive"
                onClick={() => clearAllNotifications()}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Limpiar todo</span>
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="all" className="mb-4" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread" disabled={!hasUnread}>No leídas{hasUnread && ` (${filteredNotifications.filter((n: any) => !n.read).length})`}</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Card>
          <ScrollArea className="h-[calc(100vh-200px)]">
            {filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No tienes notificaciones
              </div>
            ) : (
              <>
                {groupedNotifications.today.length > 0 && selectedTab === "all" && (
                  <>
                    <div className="p-2 bg-muted/50 text-sm font-medium">
                      Hoy
                    </div>
                    {groupedNotifications.today
                      .filter((n: any) => !['friend_request', 'friend_accepted'].includes(n.type))
                      .filter((n: any) => selectedTab === "all" || !n.read)
                      .map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onClick={() => handleNotificationClick(notification)}
                          onMarkAsRead={() => markAsRead([notification.id])}
                          onRemove={() => removeNotification(notification.id)}
                          onHandleIdeaRequest={(notificationId, senderId, accept) => handleIdeaRequest(notification, accept)}
                          onOpenChat={handleOpenChat}
                        />
                      ))}
                  </>
                )}
                
                {groupedNotifications.yesterday.length > 0 && selectedTab === "all" && (
                  <>
                    <div className="p-2 bg-muted/50 text-sm font-medium">
                      Ayer
                    </div>
                    {groupedNotifications.yesterday
                      .filter((n: any) => !['friend_request', 'friend_accepted'].includes(n.type))
                      .filter((n: any) => selectedTab === "all" || !n.read)
                      .map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onClick={() => handleNotificationClick(notification)}
                          onMarkAsRead={() => markAsRead([notification.id])}
                          onRemove={() => removeNotification(notification.id)}
                        />
                      ))}
                  </>
                )}
                
                {groupedNotifications.older.length > 0 && selectedTab === "all" && (
                  <>
                    <div className="p-2 bg-muted/50 text-sm font-medium">
                      Anteriores
                    </div>
                    {groupedNotifications.older
                      .filter((n: any) => !['friend_request', 'friend_accepted'].includes(n.type))
                      .filter((n: any) => selectedTab === "all" || !n.read)
                      .map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onClick={() => handleNotificationClick(notification)}
                          onMarkAsRead={() => markAsRead([notification.id])}
                          onRemove={() => removeNotification(notification.id)}
                        />
                      ))}
                  </>
                )}
                
                {selectedTab === "unread" && (
                  filteredNotifications
                    .filter((n: any) => !n.read)
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onMarkAsRead={() => markAsRead([notification.id])}
                        onRemove={() => removeNotification(notification.id)}
                        onHandleIdeaRequest={(notificationId, senderId, accept) => handleIdeaRequest(notification, accept)}
                        onOpenChat={handleOpenChat}
                      />
                    ))
                )}
              </>
            )}
          </ScrollArea>
        </Card>
      </main>
    </div>
  );
};

export default Notifications;
