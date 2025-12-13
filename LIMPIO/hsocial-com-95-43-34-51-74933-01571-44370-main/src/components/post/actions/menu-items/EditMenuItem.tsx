
import { Pencil } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface EditMenuItemProps {
  onEdit: () => void;
}

export function EditMenuItem({ onEdit }: EditMenuItemProps) {
  return (
    <DropdownMenuItem onClick={onEdit} className="flex items-center gap-2">
      <Pencil className="h-4 w-4" />
      Editar publicación
    </DropdownMenuItem>
  );
}
