import { Button } from "@/components/ui/button";
import { 
  LogOut,
  Moon,
  Settings,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Monitor,
  Trophy,
  Bookmark
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";

interface MenuOptionsProps {
  userId: string | null;
  onClose: () => void;
  onCopyProfileLink: () => void;
}

export function MenuOptions({ userId, onClose, onCopyProfileLink }: MenuOptionsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar sesión",
      });
    } else {
      onClose();
      navigate("/auth");
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="px-2 pb-4 bg-background">
      {/* Ver todos los perfiles - Destacado */}
      <div className="px-2 py-3">
        <Button
          variant="secondary"
          className="w-full justify-start h-11 px-3 rounded-lg font-semibold"
          onClick={() => handleNavigate(`/profile/${userId}`)}
        >
          <Users className="h-5 w-5 mr-3" />
          <span>Ver todos los perfiles</span>
        </Button>
      </div>
      
      <Separator className="my-1" />
      
      {/* Tabla de Popularidad */}
      <div className="py-1">
        <Button
          variant="ghost"
          className="w-full justify-between h-14 px-3 rounded-lg hover:bg-accent"
          onClick={() => handleNavigate("/leaderboard")}
        >
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mr-3">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <span className="font-medium">Tabla de Popularidad</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>
        
        {/* Carpetas / Guardados */}
        <Button
          variant="ghost"
          className="w-full justify-between h-14 px-3 rounded-lg hover:bg-accent"
          onClick={() => handleNavigate("/saved")}
        >
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mr-3">
              <Bookmark className="h-5 w-5" />
            </div>
            <span className="font-medium">Guardados</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>
      
        <Separator className="my-2" />
      
        {/* Configuración y privacidad */}
        <Button
          variant="ghost"
          className="w-full justify-between h-14 px-3 rounded-lg hover:bg-accent"
          onClick={() => handleNavigate("/settings")}
        >
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mr-3">
              <Settings className="h-5 w-5" />
            </div>
            <span className="font-medium">Configuración y privacidad</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>
        
        {/* Ayuda y asistencia */}
        <Button
          variant="ghost"
          className="w-full justify-between h-14 px-3 rounded-lg hover:bg-accent"
          onClick={() => toast({
            title: "Ayuda y asistencia",
            description: "Centro de ayuda próximamente disponible"
          })}
        >
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mr-3">
              <HelpCircle className="h-5 w-5" />
            </div>
            <span className="font-medium">Ayuda y asistencia</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>
        
        {/* Pantalla y accesibilidad */}
        <Button
          variant="ghost"
          className="w-full justify-between h-14 px-3 rounded-lg hover:bg-accent"
          onClick={() => handleNavigate("/settings/accessibility")}
        >
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mr-3">
              <Moon className="h-5 w-5" />
            </div>
            <span className="font-medium">Pantalla y accesibilidad</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>
        
        {/* Enviar comentarios */}
        <Button
          variant="ghost"
          className="w-full justify-between h-14 px-3 rounded-lg hover:bg-accent"
          onClick={() => toast({
            title: "Enviar comentarios",
            description: "Función de comentarios próximamente disponible"
          })}
        >
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mr-3">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium">Enviar comentarios</span>
              <span className="text-xs text-muted-foreground">CTRL B</span>
            </div>
          </div>
        </Button>
        
        {/* Cerrar sesión */}
        <Button
          variant="ghost"
          className="w-full justify-start h-14 px-3 rounded-lg hover:bg-accent"
          onClick={handleLogout}
        >
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mr-3">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="font-medium">Cerrar sesión</span>
        </Button>
      </div>
      
      {/* Footer Links */}
      <div className="px-3 py-4 mt-2">
        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
          <button className="hover:underline" onClick={() => handleNavigate("/settings/privacy")}>Privacidad</button>
          <span>·</span>
          <button className="hover:underline" onClick={() => toast({ title: "Condiciones", description: "Próximamente" })}>Condiciones</button>
          <span>·</span>
          <button className="hover:underline" onClick={() => toast({ title: "Publicidad", description: "Próximamente" })}>Publicidad</button>
          <span>·</span>
          <button className="hover:underline" onClick={() => toast({ title: "Opciones de anuncios", description: "Próximamente" })}>Opciones de anuncios</button>
          <span>·</span>
          <button className="hover:underline" onClick={() => toast({ title: "Cookies", description: "Próximamente" })}>Cookies</button>
          <span>·</span>
          <button className="hover:underline" onClick={() => toast({ title: "Más", description: "Próximamente" })}>Más</button>
        </div>
      </div>
    </div>
  );
}