import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, MessageCircle, Users, Bell, User, Search, Settings, UserPlus, PlaySquare, Plus, Menu, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigation } from "./use-navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { FriendSearch } from "@/components/FriendSearch";
import { FullScreenSearch } from "@/components/search/FullScreenSearch";
import { UserMenu } from "@/components/user-menu/UserMenu";
import { HSocialLogo } from "./HSocialLogo";

interface TopNavigationProps {
  pendingRequestsCount: number;
}

export function TopNavigation({ pendingRequestsCount }: TopNavigationProps) {
  const {
    currentUserId,
    unreadNotifications,
    newPosts,
    handleHomeClick,
    handleNotificationClick,
    location
  } = useNavigation();
  
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showFullScreenSearch, setShowFullScreenSearch] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        // Get user profile
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single();
        setUserProfile(data);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        // Get user profile on auth change
        const getProfile = async () => {
          const { data } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', session.user.id)
            .single();
          setUserProfile(data);
        };
        getProfile();
      } else {
        setUserProfile(null);
      }
    });
    
    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  // Facebook-style navigation items
  const centerNavItems = [
    {
      icon: Home,
      label: "Inicio",
      path: "/",
      onClick: handleHomeClick,
      badge: newPosts > 0 ? newPosts : null,
      isActive: location.pathname === "/"
    },
    {
      icon: Users,
      label: "Amigos",
      path: "/friends",
      isActive: location.pathname.startsWith('/friends')
    },
    {
      icon: FolderOpen,
      label: "Proyectos",
      path: "/projects",
      isActive: location.pathname.startsWith('/projects')
    },
    {
      icon: PlaySquare,
      label: "Reels",
      path: "/reels",
      isActive: location.pathname.startsWith('/reels')
    }
  ];

  const handleProfileClick = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (currentUserId) {
      navigate(`/profile/${currentUserId}`);
    }
  };

  // Mobile navigation (Instagram-style top bar)
  if (isMobile) {
    return (
      <nav className="bg-background border-b border-border fixed top-0 left-0 right-0 z-[70]">
        {/* Simplified top bar - Instagram Style */}
        <div className="flex items-center justify-between h-14 px-3">
          {/* Logo - "H Social" */}
          <HSocialLogo size="md" showText={true} />
          
          {/* Action Icons - Right */}
          <div className="flex items-center gap-1">
            {/* Notifications with Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full relative text-foreground hover:bg-muted"
              onClick={() => {
                handleNotificationClick();
                navigate("/notifications");
              }}
            >
              <Bell className="h-6 w-6" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
            
            {/* Messages */}
            <Button
              variant="ghost" 
              size="icon"
              className="h-10 w-10 rounded-full text-foreground hover:text-muted-foreground"
              onClick={() => navigate("/messages")}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            
            {/* Hamburger Menu */}
            <UserMenu />
          </div>
        </div>

        {/* Full Screen Search for Mobile */}
        <FullScreenSearch 
          isOpen={showFullScreenSearch} 
          onClose={() => setShowFullScreenSearch(false)} 
        />
      </nav>
    );
  }

  // Desktop navigation (Facebook style)
  return (
    <nav className="bg-card shadow-sm border-b border-border h-14 fixed top-0 left-0 right-0 z-[70]">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-4">
        {/* Logo and Search - Left */}
        <div className="flex items-center gap-4 flex-shrink-0 w-80">
          <HSocialLogo size="md" showText={true} />
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Button
              variant="outline"
              className="w-full justify-start pl-10 text-muted-foreground bg-muted/50 hover:bg-muted border-border rounded-full h-10"
              onClick={() => setShowFullScreenSearch(true)}
            >
              Buscar en HSocial
            </Button>
          </div>
        </div>

        {/* Center Navigation - Facebook Icons */}
        <div className="flex items-center justify-center flex-1 max-w-2xl">
          <div className="flex items-center gap-2">
            {centerNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={item.onClick}
                className={`flex items-center justify-center h-12 w-32 rounded-xl transition-all duration-200 relative group ${
                  item.isActive
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${
                  item.isActive ? 'stroke-2' : 'stroke-1.5'
                }`} />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
                {item.isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full"></div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Section - User Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 w-80 justify-end">
          {isAuthenticated && (
            <>
              {/* Profile */}
              <Button
                variant="ghost"
                className="h-10 px-3 rounded-full hover:bg-muted transition-colors"
                onClick={handleProfileClick}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {userProfile?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm font-medium text-foreground max-w-20 truncate">
                  {userProfile?.username || 'Usuario'}
                </span>
              </Button>

              {/* Plus Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 hover:scale-105 transition-all"
                title="Crear"
              >
                <Plus className="h-5 w-5" />
              </Button>

              {/* Messenger */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 hover:scale-105 transition-all relative"
                onClick={() => navigate("/messages")}
                title="Mensajes"
              >
                <MessageCircle className="h-5 w-5" />
                {pendingRequestsCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {pendingRequestsCount}
                  </Badge>
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 hover:scale-105 transition-all relative"
                onClick={() => {
                  handleNotificationClick();
                  navigate("/notifications");
                }}
                title="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <UserMenu />
            </>
          )}
        </div>
      </div>

      {/* Full Screen Search for Desktop */}
      <FullScreenSearch 
        isOpen={showFullScreenSearch} 
        onClose={() => setShowFullScreenSearch(false)} 
      />
    </nav>
  );
}