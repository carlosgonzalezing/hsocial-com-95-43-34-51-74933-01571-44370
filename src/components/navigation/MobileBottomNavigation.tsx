import { Home, User, PlusSquare, Video, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { CreateContentMenu } from "./CreateContentMenu";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MobileBottomNavigationProps {
  currentUserId: string | null;
  unreadNotifications: number;
  newPosts: number;
  pendingRequestsCount: number;
}

export function MobileBottomNavigation({
  currentUserId,
  unreadNotifications,
  newPosts,
  pendingRequestsCount
}: MobileBottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserId) {
      supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', currentUserId)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        });
    }
  }, [currentUserId]);

  const navItems = [
    {
      icon: Home,
      label: "Inicio",
      path: "/",
      badge: newPosts > 0 ? newPosts : null,
      solidFill: false
    },
    {
      icon: Search,
      label: "Explorar",
      path: "/explore",
      badge: null,
      solidFill: false
    },
    {
      icon: PlusSquare,
      label: "Crear",
      path: "/",
      badge: null,
      isAction: true,
      solidFill: false
    },
    {
      icon: Video,
      label: "Reels",
      path: "/reels",
      badge: null,
      solidFill: false
    },
    {
      icon: User,
      label: "Perfil",
      path: currentUserId ? `/profile/${currentUserId}` : "/auth",
      badge: null,
      solidFill: false,
      isProfile: true
    }
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-[60] md:hidden">
        <div className="grid grid-cols-5 items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.label === "Perfil" && location.pathname.startsWith('/profile'));
            
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.isAction) {
                    setShowCreateMenu(true);
                  } else {
                    navigate(item.path);
                  }
                }}
                className="flex flex-col items-center justify-center h-full relative"
              >
              {item.isProfile ? (
                <Avatar className={cn(
                  "h-7 w-7",
                  isActive && "ring-2 ring-[#0095f6]"
                )}>
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                (() => {
                  const Icon = item.icon as any;
                  return (
                    <Icon 
                      className={cn(
                        "h-7 w-7",
                        isActive ? "text-[#0095f6]" : "text-muted-foreground"
                      )}
                      strokeWidth={1.5}
                      fill={isActive && !item.isAction ? "currentColor" : "none"}
                    />
                  );
                })()
              )}
              
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </nav>
    
    <CreateContentMenu open={showCreateMenu} onOpenChange={setShowCreateMenu} />
    </>
  );
}