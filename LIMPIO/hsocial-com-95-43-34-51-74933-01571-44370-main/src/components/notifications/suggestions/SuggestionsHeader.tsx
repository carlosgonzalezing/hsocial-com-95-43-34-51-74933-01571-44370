
import { Sparkles } from "lucide-react";

export function SuggestionsHeader() {
  return (
    <div className="p-2 bg-muted/50 text-sm font-medium text-muted-foreground flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <span>Sugerencias para ti</span>
      </div>
    </div>
  );
}
