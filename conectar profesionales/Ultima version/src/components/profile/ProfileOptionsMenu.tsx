import { MoreHorizontal, Link2, Share2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ProfileOptionsMenuProps {
  profileId: string;
  username: string;
}

export function ProfileOptionsMenu({ profileId, username }: ProfileOptionsMenuProps) {
  const { toast } = useToast();

  const handleCopyLink = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileId}`;
    
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Enlace copiado",
        description: "El enlace del perfil se ha copiado al portapapeles"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el enlace"
      });
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${username}`,
          url: profileUrl
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleBlock = () => {
    toast({
      title: "Función en desarrollo",
      description: "Esta función estará disponible próximamente"
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="mr-2 h-4 w-4" />
          Copiar enlace de perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Compartir perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleBlock} className="text-destructive">
          <Ban className="mr-2 h-4 w-4" />
          Bloquear usuario
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
