
import { EyeOff, UserX } from "lucide-react";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface VisibilityMenuItemsProps {
  isHidden: boolean;
  username: string | null;
  onHidePost: () => void;
  onHideUser: () => void;
}

export function VisibilityMenuItems({ 
  isHidden, 
  username, 
  onHidePost, 
  onHideUser 
}: VisibilityMenuItemsProps) {
  return (
    <>
      <DropdownMenuItem 
        onClick={onHidePost} 
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <EyeOff className="mr-2 h-4 w-4" />
        {isHidden ? "Mostrar publicación" : "Ocultar publicación"}
      </DropdownMenuItem>
      
      <DropdownMenuItem 
        onClick={onHideUser} 
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <UserX className="mr-2 h-4 w-4" />
        Ocultar de {username || 'este usuario'}
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
    </>
  );
}
