import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopyLinkMenuItemProps {
  postId: string;
}

export function CopyLinkMenuItem({ postId }: CopyLinkMenuItemProps) {
  const { toast } = useToast();

  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    
    try {
      await navigator.clipboard.writeText(postUrl);
      toast({
        title: "Enlace copiado",
        description: "El enlace de la publicación se ha copiado al portapapeles"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el enlace"
      });
    }
  };

  return (
    <DropdownMenuItem onClick={handleCopyLink}>
      <Link2 className="mr-2 h-4 w-4" />
      Copiar enlace
    </DropdownMenuItem>
  );
}
