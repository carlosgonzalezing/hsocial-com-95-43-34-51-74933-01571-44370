import { useState, useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useFriends } from "@/hooks/use-friends";
import { supabase } from "@/integrations/supabase/client";
import { NotificationDropdownHeader } from "./NotificationDropdownHeader";
import { NotificationGroups } from "./NotificationGroups";
import { NotificationsSuggestions } from "./NotificationsSuggestions";
import { NotificationTabs } from "./NotificationTabs";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { notifications, handleFriendRequest, markAsRead, clearAllNotifications, removeNotification } =
    useNotifications();
  const [hasUnread, setHasUnread] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { suggestions } = useFriends(currentUserId);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Filter notifications by active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "friends") {
      return ["friend_request", "friend_accepted"].includes(notification.type);
    }
    if (activeTab === "comments") {
      return ["post_comment", "comment_reply", "mention"].includes(notification.type);
    }
    if (activeTab === "reactions") {
      return ["post_like", "story_reaction", "comment_like"].includes(notification.type);
    }
    return true;
  });

  // Group notifications by date
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const groupedNotifications = filteredNotifications.reduce(
    (acc, notification) => {
      const date = new Date(notification.created_at).toDateString();

      let group = "older";
      if (date === today) group = "today";
      else if (date === yesterday) group = "yesterday";

      if (!acc[group]) acc[group] = [];
      acc[group].push(notification);

      return acc;
    },
    { today: [], yesterday: [], older: [] },
  );

  // Calculate tab counts
  const tabCounts = {
    all: notifications.filter((n) => !n.read).length,
    friends: notifications.filter(
      (n) => !n.read && ["friend_request", "friend_accepted"].includes(n.type)
    ).length,
    comments: notifications.filter(
      (n) => !n.read && ["post_comment", "comment_reply", "mention"].includes(n.type)
    ).length,
    reactions: notifications.filter(
      (n) => !n.read && ["post_like", "story_reaction", "comment_like"].includes(n.type)
    ).length,
  };

  useEffect(() => {
    const hasUnreadNotifications = notifications.some((notification) => !notification.read);
    setHasUnread(hasUnreadNotifications);

    // Get current user
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };

    getCurrentUser();

    // Handle click outside to close dropdown if stuck
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifications, open]);

  const handleMarkAllAsRead = () => {
    markAsRead();
    setHasUnread(false);
  };

  const handleDismissSuggestion = (userId: string) => {
    console.log(`Dismissed suggestion for user ${userId}`);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      {/* ✅ CORRECCIÓN FINAL: Usamos 'fixed' y 'top-[56px]' para saltar la barra superior */}
      <PopoverContent
        ref={popoverRef}
        // Clases ajustadas para posicionamiento fijo en la ventana (viewport)
        className="w-96 p-0 fixed right-4 top-[56px] z-50 max-h-[80vh] overflow-hidden"
      >
        <NotificationDropdownHeader hasUnread={hasUnread} onMarkAllAsRead={handleMarkAllAsRead} onClose={handleClose} />
        
        <div className="px-3 py-2">
          <NotificationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={tabCounts}
          />
        </div>

        <ScrollArea className="max-h-[calc(80vh-120px)]">
          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {activeTab === "all" 
                ? "No tienes notificaciones" 
                : `No tienes notificaciones de ${
                    activeTab === "friends" ? "amigos" :
                    activeTab === "comments" ? "comentarios" :
                    "reacciones"
                  }`
              }
            </div>
          ) : (
            <>
              <NotificationGroups
                groupedNotifications={groupedNotifications}
                handleFriendRequest={handleFriendRequest}
                markAsRead={markAsRead}
                removeNotification={removeNotification}
                setOpen={setOpen}
              />

              {/* Sección de Sugerencias para ti */}
              {activeTab === "all" && showSuggestions && (
                <NotificationsSuggestions
                  suggestions={suggestions}
                  onDismissSuggestion={handleDismissSuggestion}
                  setOpen={setOpen}
                />
              )}
            </>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
