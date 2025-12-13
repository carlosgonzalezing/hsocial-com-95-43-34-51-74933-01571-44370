
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { migrateExistingFiles, checkMigrationStatus } from "@/scripts/migrate-to-r2";
import { CorsInstructions } from "./CorsInstructions";

export function R2MigrationPanel() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<{
    total: number;
    migrated: number;
    errors: number;
  } | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<{
    remainingInSupabase: number;
    migratedToR2: number;
  } | null>(null);
  
  const { toast } = useToast();

  const handleCheckStatus = async () => {
    try {
      const status = await checkMigrationStatus();
      setMigrationStatus(status);
      toast({
        title: "Estado verificado",
        description: `${status.remainingInSupabase} archivos en Supabase, ${status.migratedToR2} en R2`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo verificar el estado de la migración",
      });
    }
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateExistingFiles();
      setMigrationProgress(result);
      toast({
        title: "Migración completada",
        description: `${result.migrated} archivos migrados exitosamente`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error en migración",
        description: "Ocurrió un error durante la migración",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <CorsInstructions />
      
      <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Migración a Cloudflare R2</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleCheckStatus} variant="outline">
            Verificar Estado
          </Button>
          <Button 
            onClick={handleMigration} 
            disabled={isMigrating}
          >
            {isMigrating ? "Migrando..." : "Iniciar Migración"}
          </Button>
        </div>

        {migrationStatus && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Estado actual:</h4>
            <p>📁 Archivos en Supabase Storage: {migrationStatus.remainingInSupabase}</p>
            <p>☁️ Archivos en Cloudflare R2: {migrationStatus.migratedToR2}</p>
          </div>
        )}

        {migrationProgress && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultado de migración:</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Total: {migrationProgress.total}</span>
                <span>Migrados: {migrationProgress.migrated}</span>
                <span>Errores: {migrationProgress.errors}</span>
              </div>
              <Progress 
                value={(migrationProgress.migrated / migrationProgress.total) * 100} 
                className="w-full"
              />
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg text-sm">
          <h4 className="font-medium mb-2">⚠️ Configuración Temporal:</h4>
          <p className="mb-2">
            Actualmente usando URLs públicas temporales de Cloudflare R2 (r2.dev).
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Los archivos se están subiendo correctamente a R2</li>
            <li>Las URLs temporales funcionan pero no son personalizadas</li>
            <li>Para URLs personalizadas, configura un dominio en Cloudflare</li>
            <li>Puedes cambiar a dominio personalizado más tarde sin volver a subir archivos</li>
          </ol>
        </div>

        <div className="p-4 bg-green-50 rounded-lg text-sm">
          <h4 className="font-medium mb-2">✅ ¿Todo listo?</h4>
          <p>
            La migración ya puede funcionar con URLs temporales. 
            Simplemente haz clic en "Iniciar Migración" para comenzar.
          </p>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
