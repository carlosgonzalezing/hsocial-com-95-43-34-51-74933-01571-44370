
import { Settings } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface AudienceMenuItemProps {
  onEditAudience: () => void;
}

export function AudienceMenuItem({ onEditAudience }: AudienceMenuItemProps) {
  return (
    <DropdownMenuItem onClick={onEditAudience} className="flex items-center gap-2">
      <Settings className="h-4 w-4" />
      Editar audiencia
    </DropdownMenuItem>
  );
}
