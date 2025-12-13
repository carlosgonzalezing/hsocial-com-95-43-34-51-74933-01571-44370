
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteMenuItem } from "./menu-items/DeleteMenuItem";

interface IncognitoAuthorOptionsMenuProps {
  postId: string;
  onDelete?: () => void;
}

export function IncognitoAuthorOptionsMenu({ postId, onDelete }: IncognitoAuthorOptionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Opciones</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {onDelete && (
          <DeleteMenuItem onDelete={onDelete} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
