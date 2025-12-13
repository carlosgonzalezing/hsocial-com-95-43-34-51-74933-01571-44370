import { Home, Users, PlusSquare, Bell, Briefcase } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SimplePostModal } from "@/components/SimplePostModal";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

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
  const [showPostModal, setShowPostModal] = useState(false);
  const isVisible = useScrollDirection();

  const navItems = [
    {
      icon: Home,
      label: "Inicio",
      path: "/",
      badge: newPosts > 0 ? newPosts : null,
    },
    {
      icon: Users,
      label: "Mi red",
      path: "/friends",
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
    },
    {
      icon: PlusSquare,
      label: "Publicar",
      path: "/",
      badge: null,
      isAction: true,
    },
    {
      icon: Bell,
      label: "Notificaciones",
      path: "/notifications",
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
    {
      icon: Briefcase,
      label: "Proyectos",
      path: "/projects",
      badge: null,
    }
  ];

  return (
    <>
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 bg-background border-t border-border z-[60] md:hidden transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="grid grid-cols-5 items-center h-14">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.label === "Mi red" && location.pathname.startsWith('/friends')) ||
              (item.label === "Proyectos" && location.pathname.startsWith('/projects'));
            
            const Icon = item.icon;
            
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.isAction) {
                    setShowPostModal(true);
                  } else {
                    navigate(item.path);
                  }
                }}
                className="flex flex-col items-center justify-center h-full relative gap-0.5"
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      "h-6 w-6",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  "text-[10px]",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <SimplePostModal open={showPostModal} onOpenChange={setShowPostModal} />
    </>
  );
}
