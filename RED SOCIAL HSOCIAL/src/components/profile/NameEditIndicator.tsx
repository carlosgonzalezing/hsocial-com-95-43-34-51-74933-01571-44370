import { Badge } from "@/components/ui/badge";
import { Edit3, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NameEditIndicatorProps {
  isManuallyEdited: boolean;
  googleName?: string | null;
  className?: string;
}

export function NameEditIndicator({ 
  isManuallyEdited, 
  googleName, 
  className = "" 
}: NameEditIndicatorProps) {
  if (!isManuallyEdited) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={`text-xs ${className}`}>
            <Edit3 className="w-3 h-3 mr-1" />
            Editado
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Nombre personalizado
            </p>
            <p className="text-xs text-muted-foreground">
              Este nombre fue editado manualmente y no será modificado por Google en futuros inicios de sesión.
            </p>
            {googleName && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Nombre original de Google:</span> {googleName}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
