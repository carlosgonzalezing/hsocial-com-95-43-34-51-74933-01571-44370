import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  MessageCircle, 
  Bell,
  UserPlus,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useNavigation } from "@/components/navigation/use-navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LeftSidebarProps {
  currentUserId: string | null;
}

export function LeftSidebar({ currentUserId }: LeftSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadNotifications, newPosts, handleHomeClick, handleNotificationClick } = useNavigation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [showMore, setShowMore] = useState(false);

  // Load user profile
  useEffect(() => {
    if (!currentUserId) return;
    
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', currentUserId)
        .single();
      setUserProfile(data);
    };
    
    loadProfile();
  }, [currentUserId]);

  // Load pending requests count
  useEffect(() => {
    if (!currentUserId) return;
    
    const loadPendingRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('friendships')
          .select('id')
          .eq('friend_id', currentUserId)
          .eq('status', 'pending');
          
        if (error) throw error;
        setPendingRequestsCount(data?.length || 0);
      } catch (error) {
        console.error('Error loading pending requests count:', error);
      }
    };
    
    loadPendingRequests();
  }, [currentUserId]);

  const mainMenuItems = [
    {
      icon: Home,
      label: "Inicio",
      path: "/",
      onClick: handleHomeClick,
      badge: newPosts > 0 ? newPosts : null,
      isActive: location.pathname === "/"
    }
  ];

  const secondaryMenuItems = [
    {
      icon: UserPlus,
      label: "Seguidores",
      path: "/followers",
      badge: null,
      isActive: location.pathname.startsWith('/followers')
    },
    {
      icon: Bell,
      label: "Notificaciones",
      path: "/notifications",
      onClick: handleNotificationClick,
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      isActive: location.pathname === "/notifications"
    }
  ];

  return (
    <div className="h-full bg-background border-r border-border p-4 overflow-y-auto custom-scrollbar">
      {/* User Profile Section */}
      {currentUserId && userProfile && (
        <Link 
          to={`/profile/${currentUserId}`}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors mb-4"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.avatar_url || undefined} />
            <AvatarFallback>
              {userProfile?.username?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {userProfile?.username || 'Mi perfil'}
            </p>
          </div>
        </Link>
      )}

      <Separator className="mb-4" />

      {/* Main Menu Items */}
      <div className="space-y-2 mb-6">
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={item.onClick}
              className={cn(
                "flex items-center space-x-3 p-3.5 rounded-xl transition-colors text-sm font-medium",
                item.isActive 
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="h-5 min-w-[20px] flex items-center justify-center p-0 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      <Separator className="mb-4" />

      {/* Secondary Menu Items */}
      <div className="space-y-2">
        {secondaryMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={item.onClick}
              className={cn(
                "flex items-center space-x-3 p-3.5 rounded-xl transition-colors text-sm",
                item.isActive 
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="h-5 min-w-[20px] flex items-center justify-center p-0 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      {/* Shortcuts Section */}
      <Separator className="my-4" />
      <div className="space-y-1">
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Accesos rápidos
        </h3>
        <Link
          to="/friends"
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Mis amigos</span>
        </Link>
      </div>
    </div>
  );
}