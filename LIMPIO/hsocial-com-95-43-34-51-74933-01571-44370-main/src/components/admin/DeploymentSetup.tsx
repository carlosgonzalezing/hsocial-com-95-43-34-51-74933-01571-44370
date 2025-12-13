import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Database, Users, Shield, BarChart3, AlertTriangle } from "lucide-react";
import { getAccessControlConfig, updateAccessControlConfig } from "@/lib/api/access-control";
import { useToast } from "@/hooks/use-toast";

export function DeploymentSetup() {
  const [setupStep, setSetupStep] = useState(0);
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const { toast } = useToast();
  
  const config = getAccessControlConfig();

  const setupSteps = [
    {
      id: 'database',
      title: 'Configuración de Base de Datos',
      icon: Database,
      description: 'Crear tablas y políticas de seguridad',
      status: 'pending' as const
    },
    {
      id: 'access-control',
      title: 'Control de Acceso',
      icon: Shield,
      description: 'Configurar códigos de invitación y dominios',
      status: 'pending' as const
    },
    {
      id: 'analytics',
      title: 'Analytics y Monitoreo',
      icon: BarChart3,
      description: 'Instrumentación de métricas',
      status: 'pending' as const
    },
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      icon: Users,
      description: 'Configurar onboarding y moderación',
      status: 'pending' as const
    }
  ];

  const handleEnableRestrictedMode = () => {
    updateAccessControlConfig({ isRestrictedMode: true });
    toast({
      title: "Modo restringido activado",
      description: "Solo usuarios con código de invitación o email autorizado podrán registrarse"
    });
  };

  const handleDisableRestrictedMode = () => {
    updateAccessControlConfig({ isRestrictedMode: false });
    toast({
      title: "Modo restringido desactivado",
      description: "Registro abierto para todos los usuarios"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuración de Despliegue - H Social
          </CardTitle>
          <CardDescription>
            Configuración para el lanzamiento piloto en SENA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Modo Restringido</h4>
                <p className="text-sm text-muted-foreground">
                  Control de acceso por códigos de invitación y dominios autorizados
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={config.isRestrictedMode ? "default" : "secondary"}>
                  {config.isRestrictedMode ? "Activado" : "Desactivado"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={config.isRestrictedMode ? handleDisableRestrictedMode : handleEnableRestrictedMode}
                >
                  {config.isRestrictedMode ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>

            {config.isRestrictedMode && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Modo restringido activado. Solo usuarios con códigos válidos o emails de dominios autorizados pueden registrarse.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="invitation-codes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invitation-codes">Códigos</TabsTrigger>
          <TabsTrigger value="domains">Dominios</TabsTrigger>
          <TabsTrigger value="setup">Configuración</TabsTrigger>
          <TabsTrigger value="migration">Migración</TabsTrigger>
        </TabsList>

        <TabsContent value="invitation-codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Invitación Activos</CardTitle>
              <CardDescription>Códigos disponibles para el piloto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(config.invitationCodes).map(([code, data]) => (
                  <div key={code} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-mono font-medium">{code}</div>
                      <div className="text-sm text-muted-foreground">{data.institution}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {data.currentUses} / {data.maxUses} usos
                      </div>
                      <Progress 
                        value={(data.currentUses / data.maxUses) * 100} 
                        className="w-20 h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dominios Autorizados</CardTitle>
              <CardDescription>Dominios de email que pueden registrarse automáticamente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {config.allowedDomains.map((domain) => (
                  <div key={domain} className="flex items-center gap-2 p-2 border rounded">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-mono">{domain}</span>
                    <Badge variant="outline">SENA</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pasos de Configuración</CardTitle>
              <CardDescription>Lista de verificación para el despliegue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {setupSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < setupStep;
                  const isCurrent = index === setupStep;
                  
                  return (
                    <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-100 text-green-600' : isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <div>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : isCurrent ? (
                          <div className="h-5 w-5 border-2 border-blue-500 rounded-full animate-pulse" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan de Migración</CardTitle>
              <CardDescription>Pasos técnicos para el despliegue completo</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Database className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Antes del despliegue en producción, necesitas ejecutar las migraciones SQL en Supabase.
                  Ver el archivo <code>src/lib/database-setup.md</code> para los scripts completos.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">📋 Checklist Pre-despliegue</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✅ Código de acceso implementado (básico)</li>
                    <li>✅ Onboarding wizard creado</li>
                    <li>✅ Sistema de reportes básico</li>
                    <li>⏳ Tablas de producción (requiere migración SQL)</li>
                    <li>⏳ Políticas RLS completas</li>
                    <li>⏳ Dashboard de administración</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">🚀 Fases de Despliegue</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Fase 1:</strong> Piloto cerrado (100-200 estudiantes SENA)</div>
                    <div><strong>Fase 2:</strong> Beta abierta (300-1,000 estudiantes)</div>
                    <div><strong>Fase 3:</strong> Lanzamiento general SENA</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}