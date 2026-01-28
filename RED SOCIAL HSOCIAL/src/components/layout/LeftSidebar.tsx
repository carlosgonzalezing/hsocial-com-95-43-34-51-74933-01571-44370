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
    "/followers": { bg: "bg-sky-100 dark:bg-sky-900/25", fg: "text-sky-600 dark:text-sky-300", activeBg: "bg-sky-200 dark:bg-sky-900/45", activeFg: "text-sky-700 dark:text-sky-200" },
    "/messages": { bg: "bg-indigo-100 dark:bg-indigo-900/25", fg: "text-indigo-600 dark:text-indigo-300", activeBg: "bg-indigo-200 dark:bg-indigo-900/45", activeFg: "text-indigo-700 dark:text-indigo-200" },
    "/notifications": { bg: "bg-amber-100 dark:bg-amber-900/25", fg: "text-amber-600 dark:text-amber-300", activeBg: "bg-amber-200 dark:bg-amber-900/45", activeFg: "text-amber-700 dark:text-amber-200" },
    "/friends": { bg: "bg-teal-100 dark:bg-teal-900/25", fg: "text-teal-600 dark:text-teal-300", activeBg: "bg-teal-200 dark:bg-teal-900/45", activeFg: "text-teal-700 dark:text-teal-200" },
    "/": { bg: "bg-blue-100 dark:bg-blue-900/25", fg: "text-blue-600 dark:text-blue-300", activeBg: "bg-blue-200 dark:bg-blue-900/45", activeFg: "text-blue-700 dark:text-blue-200" },
    "/home": { bg: "bg-blue-100 dark:bg-blue-900/25", fg: "text-blue-600 dark:text-blue-300", activeBg: "bg-blue-200 dark:bg-blue-900/45", activeFg: "text-blue-700 dark:text-blue-200" },
    "/explore": { bg: "bg-violet-100 dark:bg-violet-900/25", fg: "text-violet-600 dark:text-violet-300", activeBg: "bg-violet-200 dark:bg-violet-900/45", activeFg: "text-violet-700 dark:text-violet-200" },
    "/groups": { bg: "bg-emerald-100 dark:bg-emerald-900/25", fg: "text-emerald-600 dark:text-emerald-300", activeBg: "bg-emerald-200 dark:bg-emerald-900/45", activeFg: "text-emerald-700 dark:text-emerald-200" },
    "/projects": { bg: "bg-cyan-100 dark:bg-cyan-900/25", fg: "text-cyan-600 dark:text-cyan-300", activeBg: "bg-cyan-200 dark:bg-cyan-900/45", activeFg: "text-cyan-700 dark:text-cyan-200" },
    "/analytics": { bg: "bg-rose-100 dark:bg-rose-900/25", fg: "text-rose-600 dark:text-rose-300", activeBg: "bg-rose-200 dark:bg-rose-900/45", activeFg: "text-rose-700 dark:text-rose-200" },
    "/reels": { bg: "bg-fuchsia-100 dark:bg-fuchsia-900/25", fg: "text-fuchsia-600 dark:text-fuchsia-300", activeBg: "bg-fuchsia-200 dark:bg-fuchsia-900/45", activeFg: "text-fuchsia-700 dark:text-fuchsia-200" },
    "/saved": { bg: "bg-pink-100 dark:bg-pink-900/25", fg: "text-pink-600 dark:text-pink-300", activeBg: "bg-pink-200 dark:bg-pink-900/45", activeFg: "text-pink-700 dark:text-pink-200" },
    "/groups/create": { bg: "bg-slate-100 dark:bg-slate-800/50", fg: "text-slate-700 dark:text-slate-200", activeBg: "bg-slate-200 dark:bg-slate-700/60", activeFg: "text-slate-800 dark:text-slate-100" },
  };

  const defaultIconStyle = { bg: "bg-muted", fg: "text-[#65676B] dark:text-slate-300", activeBg: "bg-primary/10", activeFg: "text-primary" };

  const getIconStyle = (path: string) => iconStyles[path] ?? defaultIconStyle;

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

  return (
    <aside className="h-full bg-card border-r border-border overflow-y-auto custom-scrollbar">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-[#050505] dark:text-white">Panel</h2>
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
              <p className="text-lg font-semibold text-[#050505] dark:text-white">{userProfile?.username || "Mi perfil"}</p>
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
                  "group flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive ? "bg-primary/5" : "hover:bg-muted/50"
                )
              }
            >
              {({ isActive }) => {
                const style = getIconStyle(item.path);
                const iconWrapperClassName = cn(
                  "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 ease-out shadow-sm ring-1 ring-black/5 dark:ring-white/10 group-hover:shadow-md group-hover:scale-[1.03] group-hover:brightness-95 group-active:scale-[0.99]",
                  isActive ? style.activeBg : style.bg
                );
                const iconClassName = cn(
                  "h-5 w-5 transition-colors duration-200 group-hover:opacity-90",
                  isActive ? style.activeFg : style.fg
                );
                const labelClassName = cn(
                  "flex-1 truncate",
                  isActive
                    ? "text-[#050505] dark:text-white font-semibold"
                    : "text-[#1C1E21] dark:text-slate-200 font-medium"
                );
                return (
                  <>
                    <span className={iconWrapperClassName}>
                      <item.icon className={iconClassName} />
                    </span>
                    <span className={labelClassName}>{item.label}</span>
                    {item.path === "/notifications" && unreadNotifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 min-w-[20px] flex items-center justify-center p-0 text-xs"
                      >
                        {unreadNotifications}
                      </Badge>
                    )}
                  </>
                );
              }}
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
                "group flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive ? "bg-primary/5" : "hover:bg-muted/50"
              )
            }
          >
            {({ isActive }) => {
              const style = getIconStyle(item.path);
              const iconWrapperClassName = cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 ease-out shadow-sm ring-1 ring-black/5 dark:ring-white/10 group-hover:shadow-md group-hover:scale-[1.03] group-hover:brightness-95 group-active:scale-[0.99]",
                isActive ? style.activeBg : style.bg
              );
              const iconClassName = cn(
                "h-5 w-5 transition-colors duration-200 group-hover:opacity-90",
                isActive ? style.activeFg : style.fg
              );
              const labelClassName = cn(
                "flex-1 truncate",
                isActive
                  ? "text-[#050505] dark:text-white font-semibold"
                  : "text-[#1C1E21] dark:text-slate-200 font-medium"
              );
              return (
                <>
                  <span className={iconWrapperClassName}>
                    <item.icon className={iconClassName} />
                  </span>
                  <span className={labelClassName}>{item.label}</span>
                  {item.path === "/" && newPosts > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 min-w-[20px] flex items-center justify-center p-0 text-xs"
                    >
                      {newPosts}
                    </Badge>
                  )}
                </>
              );
            }}
          </NavLink>
        ))}

        <Separator className="my-3" />

        <NavLink
          to="/groups/create"
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive ? "bg-primary/5" : "hover:bg-muted/50"
            )
          }
        >
          {({ isActive }) => {
            const style = getIconStyle("/groups/create");
            const labelClassName = cn(
              "truncate",
              isActive
                ? "text-[#050505] dark:text-white font-semibold"
                : "text-[#1C1E21] dark:text-slate-200 font-medium"
            );
            return (
              <>
                <span
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 ease-out shadow-sm ring-1 ring-black/5 dark:ring-white/10 group-hover:shadow-md group-hover:scale-[1.03] group-hover:brightness-95 group-active:scale-[0.99]",
                    isActive ? style.activeBg : style.bg
                  )}
                >
                  <Plus
                    className={cn(
                      "h-5 w-5 transition-colors duration-200 group-hover:opacity-90",
                      isActive ? style.activeFg : style.fg
                    )}
                  />
                </span>
                <span className={labelClassName}>Crear grupo</span>
              </>
            );
          }}
        </NavLink>
      </nav>
    </aside>
  );
}