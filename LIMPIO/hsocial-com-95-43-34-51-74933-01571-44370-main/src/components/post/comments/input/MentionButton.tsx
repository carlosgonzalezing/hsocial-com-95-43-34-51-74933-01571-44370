
import { AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MentionButtonProps {
  onClick: () => void;
}

export function MentionButton({ onClick }: MentionButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onClick}
      className="text-xs flex items-center gap-1"
    >
      <AtSign className="h-3 w-3" />
      Mencionar
    </Button>
  );
}
