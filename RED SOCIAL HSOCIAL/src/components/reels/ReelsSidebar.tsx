import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Video, Compass, Bookmark, UserPlus, Bell, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useNavigation } from '@/components/navigation/use-navigation';

const menuItems = [
  { title: 'Inicio', url: '/', icon: Home },
  { title: 'Reels', url: '/reels', icon: Video },
  { title: 'Explorar', url: '/explore', icon: Compass },
  { title: 'Guardados', url: '/saved', icon: Bookmark },
];

const quickAccessItems = [
  { title: 'Seguidores', url: '/followers', icon: UserPlus },
  { title: 'Notificaciones', url: '/notifications', icon: Bell },
  { title: 'Mi red', url: '/friends', icon: Users },
];

export function ReelsSidebar() {
  const { unreadNotifications, handleNotificationClick } = useNavigation();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground">Videos</h2>
      </div>
      
      <nav className="flex-1 px-3">
        <div className="mb-2">
          {quickAccessItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              onClick={item.url === '/notifications' ? handleNotificationClick : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.title}</span>
              {item.url === '/notifications' && unreadNotifications > 0 && (
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
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 text-xs text-muted-foreground border-t border-border">
        <p>HSocial © 2025</p>
        <p className="mt-1">Red social universitaria</p>
      </div>
    </aside>
  );
}
