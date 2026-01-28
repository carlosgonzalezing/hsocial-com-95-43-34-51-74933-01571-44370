import { FeatureGate } from '@/components/subscription/FeatureGate';
import { FeatureBadge } from '@/components/subscription/FeatureGate';
import { useSubscription } from '@/hooks/useSubscription';

// Componente de ejemplo para mostrar cómo integrar las features de suscripción
export function ExampleIntegration() {
  const { isPro, isFounder, canUseFeature } = useSubscription();

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Ejemplos de Integración</h2>
      
      {/* Ejemplo 1: Botón de crear grupo */}
      <FeatureGate feature="groups">
        <button className="bg-purple-600 text-white px-4 py-2 rounded">
          Crear Nuevo Grupo
        </button>
      </FeatureGate>

      {/* Ejemplo 2: Badge en perfil */}
      <div className="flex items-center gap-2">
        <span>John Doe</span>
        <FeatureBadge feature="connections" />
      </div>

      {/* Ejemplo 3: Contenido condicional */}
      {canUseFeature('aiGenerations') ? (
        <div className="bg-green-50 p-4 rounded">
          🤖 Asistente de IA disponible
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded">
          Mejora a Creator para usar IA
        </div>
      )}

      {/* Ejemplo 4: Límites de uso */}
      <FeatureGate 
        feature="connections" 
        fallback={
          <div className="text-orange-600">
            Has alcanzado tu límite de 100 conexiones
          </div>
        }
      >
        <div>Conexiones disponibles</div>
      </FeatureGate>
    </div>
  );
}

// Hook personalizado para features específicas
export function useFeatureAccess() {
  const { canUseFeature, isPro, isFounder } = useSubscription();

  return {
    canCreateGroups: canUseFeature('groups'),
    canCreateEvents: canUseFeature('events'),
    canUseAI: canUseFeature('aiGenerations'),
    hasUnlimitedConnections: canUseFeature('connections'),
    isPremiumUser: isPro || isFounder,
    isFounderUser: isFounder
  };
}
