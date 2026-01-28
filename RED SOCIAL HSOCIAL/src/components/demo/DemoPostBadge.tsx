import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DemoPostBadge() {
  return (
    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
      <Sparkles className="h-3 w-3" />
      Post de Ejemplo
    </Badge>
  );
}
