import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

export default function AccessibilitySettings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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
        <h1 className="text-2xl font-bold">Pantalla y accesibilidad</h1>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Modo oscuro</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ajusta la apariencia de HSocial para reducir el deslumbramiento y dar a tus ojos un descanso.
          </p>
          
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5" />
              <div>
                <p className="font-medium">Desactivado</p>
                <p className="text-xs text-muted-foreground">Modo claro estándar</p>
              </div>
            </div>
            {theme === "light" && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </div>
          
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5" />
              <div>
                <p className="font-medium">Activado</p>
                <p className="text-xs text-muted-foreground">Reduce el brillo de la pantalla</p>
              </div>
            </div>
            {theme === "dark" && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="font-medium">Modo oscuro</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {theme === "dark" ? "Activado" : "Desactivado"}
              </span>
              <Switch 
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Tamaño del texto</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ajusta el tamaño del texto para mejorar la legibilidad.
          </p>
          <Button variant="outline" className="w-full" onClick={() => {}}>
            Ajustar tamaño del texto
          </Button>
        </Card>
      </div>
    </div>
  );
}
