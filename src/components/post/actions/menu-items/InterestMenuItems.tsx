
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface InterestMenuItemsProps {
  onSetInterest: (level: 'interested' | 'not_interested') => void;
}

export function InterestMenuItems({ onSetInterest }: InterestMenuItemsProps) {
  return (
    <>
      <DropdownMenuItem 
        onClick={() => onSetInterest('interested')}
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ThumbsUp className="mr-2 h-4 w-4" />
        Me interesa este contenido
      </DropdownMenuItem>
      
      <DropdownMenuItem 
        onClick={() => onSetInterest('not_interested')}
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ThumbsDown className="mr-2 h-4 w-4" />
        No me interesa este contenido
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
    </>
  );
}
