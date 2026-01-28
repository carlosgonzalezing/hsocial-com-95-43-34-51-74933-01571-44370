import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Zap, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface FeatureGateProps {
  feature: 'connections' | 'groups' | 'events' | 'aiGenerations';
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true,
  className = '' 
}: FeatureGateProps) {
  const { canUseFeature, upgradeRequired, isPro, isFounder, remainingDays } = useSubscription();

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  if (upgradeRequired(feature) && showUpgradePrompt) {
    return (
      <Card className={`p-6 border-orange-200 bg-orange-50 ${className}`}>
        <div className="text-center">
          <Lock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          
          <h3 className="text-lg font-semibold mb-2">
            {isFounder ? 'Feature de Creator' : 'Mejora a Creator'}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {isFounder 
              ? `Esta función está disponible para usuarios Creator. Tienes acceso gratuito durante ${remainingDays} días de beta.`
              : 'Esta función requiere el plan Creator para desbloquear todo el potencial de H-Social.'
            }
          </p>

          {isFounder && (
            <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <Crown className="w-4 h-4" />
                <span className="font-medium">Eres Founder</span>
                <Crown className="w-4 h-4" />
              </div>
              <p className="text-sm text-green-700 mt-1">
                Solicita acceso a esta función y la activaremos gratis durante la beta
              </p>
            </div>
          )}

          <div className="space-y-2">
            {isFounder ? (
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Crown className="w-4 h-4 mr-2" />
                Solicitar Acceso Founder
              </Button>
            ) : (
              <>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Mejorar a Creator
                </Button>
                <p className="text-xs text-muted-foreground">
                  $9.99/mes • Founders: GRATIS durante beta
                </p>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Si no se muestra upgrade prompt, mostrar fallback personalizado o por defecto
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className={`p-4 border-gray-200 bg-gray-50 ${className}`}>
      <div className="flex items-center gap-3 text-muted-foreground">
        <Lock className="w-4 h-4" />
        <span className="text-sm">
          Esta función requiere el plan Creator
        </span>
      </div>
    </Card>
  );
}

interface FeatureBadgeProps {
  feature: 'connections' | 'groups' | 'events' | 'aiGenerations';
  className?: string;
}

export function FeatureBadge({ feature, className = '' }: FeatureBadgeProps) {
  const { canUseFeature, isPro, isFounder } = useSubscription();

  if (canUseFeature(feature)) {
    if (isFounder) {
      return (
        <Badge className={`bg-green-100 text-green-800 border-green-200 ${className}`}>
          <Crown className="w-3 h-3 mr-1" />
          Founder
        </Badge>
      );
    }
    
    if (isPro) {
      return (
        <Badge className={`bg-purple-100 text-purple-800 border-purple-200 ${className}`}>
          <Zap className="w-3 h-3 mr-1" />
          Creator
        </Badge>
      );
    }

    return (
      <Badge className={`bg-blue-100 text-blue-800 border-blue-200 ${className}`}>
        Starter
      </Badge>
    );
  }

  return (
    <Badge className={`bg-orange-100 text-orange-800 border-orange-200 ${className}`}>
      <Lock className="w-3 h-3 mr-1" />
      Creator
    </Badge>
  );
}
