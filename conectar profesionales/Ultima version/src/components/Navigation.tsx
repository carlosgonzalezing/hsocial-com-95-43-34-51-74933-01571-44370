import { Home, MessageCircle, User, Heart, UserPlus, Film, TrendingUp, Users, Video, Bell, Crown, FolderOpen } from "lucide-react";
import { NavigationItem } from "./navigation/NavigationItem";
import { useNavigation } from "./navigation/use-navigation";
import { useFriends } from "@/hooks/use-friends";
import type { NavigationLink } from "./navigation/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MobileBottomNavigation } from "./navigation/MobileBottomNavigation";
import { TopNavigation } from "./navigation/TopNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
const navigationItems = [
  { name: "Inicio", path: "/", icon: Home },
  { name: "Amigos", path: "/friends", icon: Users },
  { name: "Perfil", path: "/profile", icon: User },
];

export function Navigation() {
  const {
    currentUserId,
    unreadNotifications,
    newPosts,
    handleLogout,
    handleHomeClick,
    handleNotificationClick,
    location
  } = useNavigation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    if (!currentUserId) return;
    
    const loadPendingRequests = async () => {
      try {
        const { data, error } = await (supabase as any)
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
    
    const friendshipsChannel = supabase
      .channel('friendships_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `friend_id=eq.${currentUserId}`,
      }, () => {
        loadPendingRequests();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(friendshipsChannel);
    };
  }, [currentUserId]);

  const handleProfileClick = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (uid) {
      navigate(`/profile/${uid}`);
    }
  };

  const links: NavigationLink[] = [
    { 
      to: "/",
      icon: Home, 
      label: "Inicio",
      hideLabel: true,
      onClick: handleHomeClick,
      badge: newPosts > 0 ? newPosts : null 
    },
    {
      to: "/followers",
      icon: UserPlus,
      label: "Seguidores",
      hideLabel: true,
      badge: null,
      badgeVariant: "secondary"
    },
    { 
      to: currentUserId ? `/profile/${currentUserId}` : "#", 
      icon: User, 
      label: "Perfil",
      hideLabel: true,
      onClick: handleProfileClick
    }
  ];

  const isProfilePage = location.pathname.startsWith('/profile');
  const isFollowersPage = location.pathname.startsWith('/followers');
  const isReelsPage = location.pathname.startsWith('/reels');

  // Show mobile bottom navigation on mobile devices
  if (isMobile) {
    return (
      <MobileBottomNavigation
        currentUserId={currentUserId}
        unreadNotifications={unreadNotifications}
        newPosts={newPosts}
        pendingRequestsCount={pendingRequestsCount}
      />
    );
  }

  // Desktop navigation - Top bar Facebook style
  return (
    <TopNavigation
      pendingRequestsCount={pendingRequestsCount}
    />
  );
}
