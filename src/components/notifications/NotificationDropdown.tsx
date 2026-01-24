import { useState, useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationDropdownHeader } from "./NotificationDropdownHeader";
import { NotificationGroups } from "./NotificationGroups";
import { NotificationTabs } from "./NotificationTabs";
import { useNavigate } from "react-router-dom";

interface NotificationDropdownProps {
  triggerClassName?: string;
  iconClassName?: string;
  onOpen?: () => void;
}

export function NotificationDropdown({ triggerClassName, iconClassName, onOpen }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const { notifications, markAsRead, removeNotification } = useNotifications();
  const [hasUnread, setHasUnread] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'friends') {
      setActiveTab('all');
    }
  }, [activeTab]);

  // Filter notifications by active tab
  const filteredNotifications = notifications.filter((notification) => {
    // Friends/requests removed globally
    if (["friend_request", "friend_accepted"].includes(notification.type)) return false;
    if (activeTab === "all") return true;
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
    all: notifications.filter((n) => !n.read && !["friend_request", "friend_accepted"].includes(n.type)).length,
    comments: notifications.filter(
      (n) => !n.read && ["post_comment", "comment_reply", "mention"].includes(n.type)
    ).length,
    reactions: notifications.filter(
      (n) => !n.read && ["post_like", "story_reaction", "comment_like"].includes(n.type)
    ).length,
  };

  useEffect(() => {
    const hasUnreadNotifications = notifications.some(
      (notification) => !notification.read && !["friend_request", "friend_accepted"].includes(notification.type)
    );
    setHasUnread(hasUnreadNotifications);

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

  const handleClose = () => {
    setOpen(false);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/notifications");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      onOpen?.();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={triggerClassName ?? "relative rounded-full"}>
          <Bell className={iconClassName ?? "h-5 w-5"} />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium">
              {tabCounts.all > 9 ? "9+" : tabCounts.all}
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
        <NotificationDropdownHeader
          hasUnread={hasUnread}
          onMarkAllAsRead={handleMarkAllAsRead}
          onViewAll={handleViewAll}
          onClose={handleClose}
        />
        
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
                    activeTab === "comments" ? "comentarios" :
                    "reacciones"
                  }`
              }
            </div>
          ) : (
            <>
              <NotificationGroups
                groupedNotifications={groupedNotifications}
                handleFriendRequest={() => {}}
                markAsRead={markAsRead}
                removeNotification={removeNotification}
                setOpen={setOpen}
              />
            </>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
