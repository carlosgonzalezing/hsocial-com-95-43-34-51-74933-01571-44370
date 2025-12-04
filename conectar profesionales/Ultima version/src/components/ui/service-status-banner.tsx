import { AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServiceStatusBannerProps {
  hasErrors: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ServiceStatusBanner({ hasErrors, onRetry, className }: ServiceStatusBannerProps) {
  if (!hasErrors) return null;

  return (
    <Alert className={cn("border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950", className)}>
      <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span className="text-orange-800 dark:text-orange-200">
          Algunos servicios están temporalmente no disponibles
        </span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900"
          >
            Reintentar
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}