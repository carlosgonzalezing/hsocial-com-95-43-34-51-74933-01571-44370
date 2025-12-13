
import { Trash2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface DeleteMenuItemProps {
  onDelete: () => void;
}

export function DeleteMenuItem({ onDelete }: DeleteMenuItemProps) {
  return (
    <DropdownMenuItem 
      onClick={onDelete}
      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Eliminar publicación
    </DropdownMenuItem>
  );
}
