import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationPermissionBanner() {
  const { isSupported, permission, isEnabled, requestPermission } = usePushNotifications();
  const [isDismissed, setIsDismissed] = useState(false);

  // Mostrar banner solo si las notificaciones están soportadas pero no habilitadas
  const shouldShow = isSupported && !isEnabled && permission !== 'denied' && !isDismissed;

  useEffect(() => {
    // Auto-dismiss after showing for 10 seconds
    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsDismissed(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <Alert className="mb-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <Bell className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <strong>Activar notificaciones push</strong>
          <p className="text-sm text-muted-foreground mt-1">
            Recibe mensajes, corazones y reacciones en tiempo real, incluso cuando no estés en la app
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            size="sm"
            onClick={requestPermission}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Activar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}