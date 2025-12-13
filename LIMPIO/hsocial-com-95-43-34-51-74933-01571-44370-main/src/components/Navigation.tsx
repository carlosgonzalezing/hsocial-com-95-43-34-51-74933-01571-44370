import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, User, Users, Bell, Settings } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Perfil', path: '/profile', icon: User },
    { name: 'Amigos', path: '/friends', icon: Users },
    { name: 'Notificaciones', path: '/notifications', icon: Bell },
    { name: 'Configuración', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="flex flex-col space-y-2 p-4">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Button
            key={item.path}
            asChild
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start',
              isActive ? 'bg-accent' : ''
            )}
          >
            <Link to={item.path} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

// También exportamos por defecto para mantener compatibilidad con importaciones existentes
export default Navigation;