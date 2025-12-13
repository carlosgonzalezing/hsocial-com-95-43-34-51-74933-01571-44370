
import { Pin } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface PinMenuItemProps {
  isPinned: boolean;
  onTogglePin: () => void;
}

export function PinMenuItem({ isPinned, onTogglePin }: PinMenuItemProps) {
  return (
    <DropdownMenuItem onClick={onTogglePin} className="flex items-center gap-2">
      <Pin className="h-4 w-4" />
      {isPinned ? "Desfijar publicación" : "Fijar publicación"}
    </DropdownMenuItem>
  );
}
