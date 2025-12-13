import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Video, Compass, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Inicio', url: '/', icon: Home },
  { title: 'Reels', url: '/reels', icon: Video },
  { title: 'Explorar', url: '/explore', icon: Compass },
  { title: 'Guardados', url: '/saved', icon: Bookmark },
];

export function ReelsSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground">Videos</h2>
      </div>
      
      <nav className="flex-1 px-3">
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
