
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

export default function SecuritySettings() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6 gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Contraseña y seguridad</h1>
      </div>

      {/* Login and Recovery Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-1">Inicio de sesión y recuperación</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Administra tus contraseñas, preferencias de inicio de sesión y métodos de recuperación.
        </p>

        <Card className="border-none shadow-sm">
          <div className="divide-y divide-border">
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between p-4 h-auto"
            >
              <span className="font-medium">Cambiar contraseña</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between p-4 h-auto"
            >
              <span className="font-medium">Autenticación en dos pasos</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between p-4 h-auto"
            >
              <div className="flex-1 text-left">
                <span className="font-medium">Inicio de sesión guardado</span>
              </div>
              <div className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Button>
          </div>
        </Card>
      </div>

      {/* Security Controls Section */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Controles de seguridad</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Revisa los problemas de seguridad mediante comprobaciones en las aplicaciones, los dispositivos y los correos electrónicos enviados.
        </p>

        <Card className="border-none shadow-sm">
          <div className="divide-y divide-border">
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between p-4 h-auto"
            >
              <span className="font-medium">Dónde has iniciado sesión</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between p-4 h-auto"
            >
              <span className="font-medium">Alertas de inicio de sesión</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between p-4 h-auto"
            >
              <span className="font-medium">Correos electrónicos recientes</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between p-4 h-auto"
            >
              <div className="flex-1 text-left">
                <span className="font-medium">Comprobación rápida de seguridad</span>
              </div>
              <div className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
