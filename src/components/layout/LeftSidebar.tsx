import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Briefcase,
  BarChart3,
  Compass,
  Home,
  MessageCircle,
  Plus,
  User,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useNavigation } from "@/components/navigation/use-navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LeftSidebarProps {
  currentUserId: string | null;
}

export function LeftSidebar({ currentUserId }: LeftSidebarProps) {
  const { unreadNotifications, newPosts, handleHomeClick, handleNotificationClick } = useNavigation();
  const [userProfile, setUserProfile] = useState<any>(null);

  const iconStyles: Record<string, { bg: string; fg: string; activeBg: string; activeFg: string }> = {
    "/followers": { bg: "bg-sky-100", fg: "text-sky-600", activeBg: "bg-sky-200", activeFg: "text-sky-700" },
    "/messages": { bg: "bg-indigo-100", fg: "text-indigo-600", activeBg: "bg-indigo-200", activeFg: "text-indigo-700" },
    "/notifications": { bg: "bg-amber-100", fg: "text-amber-600", activeBg: "bg-amber-200", activeFg: "text-amber-700" },
    "/friends": { bg: "bg-teal-100", fg: "text-teal-600", activeBg: "bg-teal-200", activeFg: "text-teal-700" },
    "/": { bg: "bg-blue-100", fg: "text-blue-600", activeBg: "bg-blue-200", activeFg: "text-blue-700" },
    "/home": { bg: "bg-blue-100", fg: "text-blue-600", activeBg: "bg-blue-200", activeFg: "text-blue-700" },
    "/explore": { bg: "bg-violet-100", fg: "text-violet-600", activeBg: "bg-violet-200", activeFg: "text-violet-700" },
    "/groups": { bg: "bg-emerald-100", fg: "text-emerald-600", activeBg: "bg-emerald-200", activeFg: "text-emerald-700" },
    "/projects": { bg: "bg-cyan-100", fg: "text-cyan-600", activeBg: "bg-cyan-200", activeFg: "text-cyan-700" },
    "/analytics": { bg: "bg-rose-100", fg: "text-rose-600", activeBg: "bg-rose-200", activeFg: "text-rose-700" },
    "/reels": { bg: "bg-fuchsia-100", fg: "text-fuchsia-600", activeBg: "bg-fuchsia-200", activeFg: "text-fuchsia-700" },
    "/saved": { bg: "bg-pink-100", fg: "text-pink-600", activeBg: "bg-pink-200", activeFg: "text-pink-700" },
    "/groups/create": { bg: "bg-slate-100", fg: "text-slate-700", activeBg: "bg-slate-200", activeFg: "text-slate-800" },
  };

  const defaultIconStyle = { bg: "bg-muted", fg: "text-foreground", activeBg: "bg-muted", activeFg: "text-foreground" };

  const getIconStyle = (path: string) => iconStyles[path] ?? defaultIconStyle;

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

  const quickAccessItems = [
    { icon: UserPlus, label: "Seguidores", path: "/followers" },
    { icon: MessageCircle, label: "Mensajes", path: "/messages" },
    { icon: Bell, label: "Notificaciones", path: "/notifications", onClick: handleNotificationClick },
    { icon: Users, label: "Mi red", path: "/friends" },
  ];

  const menuItems = [
    { icon: Home, label: "Inicio", path: "/", onClick: handleHomeClick },
    { icon: Compass, label: "Explorar", path: "/explore" },
    { icon: Users, label: "Grupos", path: "/groups" },
    { icon: Briefcase, label: "Proyectos", path: "/projects" },
    { icon: BarChart3, label: "Analytics Pro", path: "/analytics" },
    { icon: Video, label: "Reels", path: "/reels" },
    { icon: Bookmark, label: "Guardados", path: "/saved" },
  ];

  return (
    <aside className="h-full bg-card border-r border-border overflow-y-auto custom-scrollbar">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground">Panel</h2>
      </div>

      <div className="px-4 pb-4">
        {currentUserId && userProfile && (
          <Link
            to={`/profile/${currentUserId}`}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile?.avatar_url || undefined} />
              <AvatarFallback>
                {userProfile?.username?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{userProfile?.username || "Mi perfil"}</p>
            </div>
          </Link>
        )}
      </div>

      <nav className="flex-1 px-3">
        <div className="mb-2">
          {quickAccessItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={item.onClick}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              {(() => {
                const style = getIconStyle(item.path);
                const iconWrapperClassName = cn(
                  "h-9 w-9 rounded-full flex items-center justify-center transition-colors shadow-sm ring-1 ring-black/5 group-hover:shadow-md",
                  style.bg
                );
                const iconClassName = cn("h-5 w-5", style.fg, "transition-colors");
                return (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        iconWrapperClassName,
                        isActive ? style.activeBg : style.bg
                      )
                    }
                    onClick={(e) => e.preventDefault()}
                    tabIndex={-1}
                    aria-hidden
                  >
                    <item.icon
                      className={cn(
                        iconClassName,
                        ({ isActive }: any) => (isActive ? style.activeFg : style.fg)
                      )}
                    />
                  </NavLink>
                );
              })()}
              <span className="flex-1">{item.label}</span>
              {item.path === "/notifications" && unreadNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 min-w-[20px] flex items-center justify-center p-0 text-xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </NavLink>
          ))}
        </div>

        <div className="h-px bg-border my-3" />

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={item.onClick}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            {(() => {
              const style = getIconStyle(item.path);
              const iconWrapperClassName = cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-colors shadow-sm ring-1 ring-black/5 group-hover:shadow-md",
                style.bg
              );
              const iconClassName = cn("h-5 w-5", style.fg, "transition-colors");
              return (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      iconWrapperClassName,
                      isActive ? style.activeBg : style.bg
                    )
                  }
                  onClick={(e) => e.preventDefault()}
                  tabIndex={-1}
                  aria-hidden
                >
                  <item.icon
                    className={cn(
                      iconClassName,
                      ({ isActive }: any) => (isActive ? style.activeFg : style.fg)
                    )}
                  />
                </NavLink>
              );
            })()}
            <span className="flex-1">{item.label}</span>
            {item.path === "/" && newPosts > 0 && (
              <Badge
                variant="destructive"
                className="h-5 min-w-[20px] flex items-center justify-center p-0 text-xs"
              >
                {newPosts}
              </Badge>
            )}
          </NavLink>
        ))}

        <Separator className="my-3" />

        <NavLink
          to="/groups/create"
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          {(() => {
            const style = getIconStyle("/groups/create");
            return (
              <span className={cn("h-9 w-9 rounded-full flex items-center justify-center shadow-sm ring-1 ring-black/5 group-hover:shadow-md", style.bg)}>
                <Plus className={cn("h-5 w-5", style.fg)} />
              </span>
            );
          })()}
          <span>Crear grupo</span>
        </NavLink>
      </nav>
    </aside>
  );
}