
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MenuHeaderProps {
  onClose: () => void;
}

export function MenuHeader({ onClose }: MenuHeaderProps) {
  return (
    <div className="flex items-center justify-between py-4 px-4 border-b bg-background">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">Menú</h2>
      </div>
    </div>
  );
}
