import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { Heart, TrendingUp, Award, BarChart3 } from "lucide-react";
// Removed engagement components for performance

export default function StatisticsSettings() {
  const { user } = useAuth();

  if (!user) {
    return <div>Debes iniciar sesión para ver tus estadísticas</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Estadísticas Básicas</h3>
        <p className="text-sm text-muted-foreground">
          Vista simplificada de tu perfil (engagement removido para mayor rendimiento)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Perfil Optimizado
          </CardTitle>
          <CardDescription>Sistema simplificado para mayor velocidad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="space-y-4">
              <div className="text-4xl">⚡</div>
              <div>
                <h4 className="font-medium">Sistema de estadísticas avanzadas removido</h4>
                <p className="text-sm">Para optimizar rendimiento y velocidad de carga</p>
              </div>
              <Badge variant="secondary" className="mt-4">
                Enfoque en contenido y conexiones
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Funciones Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-sm font-medium text-center">Crear Posts</div>
              <div className="text-xs text-muted-foreground text-center">Ideas y contenido</div>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">💬</div>
              <div className="text-sm font-medium text-center">Chat Global</div>
              <div className="text-xs text-muted-foreground text-center">Comunicación rápida</div>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium text-center">Red de Amigos</div>
              <div className="text-xs text-muted-foreground text-center">Conexiones</div>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">💡</div>
              <div className="text-sm font-medium text-center">OpHub</div>
              <div className="text-xs text-muted-foreground text-center">Oportunidades</div>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">❤️</div>
              <div className="text-sm font-medium text-center">Reacciones</div>
              <div className="text-xs text-muted-foreground text-center">Interacciones</div>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <div className="text-sm font-medium text-center">Responsive</div>
              <div className="text-xs text-muted-foreground text-center">Mobile-first</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}