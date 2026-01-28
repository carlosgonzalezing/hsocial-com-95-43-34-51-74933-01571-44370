import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Users, Calendar, Brain, BarChart, TrendingUp, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export function SubscriptionStatus() {
  const { subscription, limits, isPro, isFounder, remainingDays } = useSubscription();
  const [showDetails, setShowDetails] = useState(false);

  if (!subscription) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Cargando información...</h3>
        </div>
      </Card>
    );
  }

  const getPlanIcon = () => {
    if (isFounder) return <Crown className="w-5 h-5" />;
    if (isPro) return <Zap className="w-5 h-5" />;
    return <Users className="w-5 h-5" />;
  };

  const getPlanBadge = () => {
    if (isFounder) {
      return (
        <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Founder
        </Badge>
      );
    }
    
    if (isPro) {
      return (
        <Badge className="bg-purple-600 text-white">
          <Zap className="w-3 h-3 mr-1" />
          Creator
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-600 text-white">
        Starter
      </Badge>
    );
  };

  const getUsageProgress = (current: number, limit: number) => {
    if (limit === -1) return { percentage: 0, isNearLimit: false, isOverLimit: false };
    const percentage = Math.min((current / limit) * 100, 100);
    return {
      percentage,
      isNearLimit: percentage >= 80,
      isOverLimit: percentage >= 100
    };
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'connections': return <Users className="w-4 h-4" />;
      case 'groups': return <Users className="w-4 h-4" />;
      case 'events': return <Calendar className="w-4 h-4" />;
      case 'aiGenerations': return <Brain className="w-4 h-4" />;
      default: return <BarChart className="w-4 h-4" />;
    }
  };

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'connections': return 'Conexiones';
      case 'groups': return 'Grupos';
      case 'events': return 'Eventos';
      case 'aiGenerations': return 'Generaciones IA';
      default: return feature;
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {getPlanIcon()}
            <div>
              <h3 className="text-lg font-semibold">Plan {subscription.plan === 'creator' ? 'Creator' : 'Starter'}</h3>
              <p className="text-sm text-muted-foreground">
                {isFounder 
                  ? `Acceso Founder • ${remainingDays} días restantes de beta`
                  : subscription.status === 'active' 
                    ? 'Activo' 
                    : subscription.status
                }
              </p>
            </div>
          </div>
          {getPlanBadge()}
        </div>

        {/* Founder Special Banner */}
        {isFounder && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Beneficios Founder</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
              <div>✅ Acceso completo durante beta</div>
              <div>✅ 50% descuento vitalicio</div>
              <div>✅ Badge exclusivo 👑</div>
              <div>✅ Soporte prioritario</div>
            </div>
          </div>
        )}

        {/* Usage Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Uso Actual
            </h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Ocultar' : 'Ver'} detalles
            </Button>
          </div>

          {Object.entries(limits).map(([key, limit]) => {
            const progress = getUsageProgress(limit.current, limit.limit);
            const isUnlimited = limit.limit === -1;

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getFeatureIcon(key)}
                    <span>{getFeatureName(key)}</span>
                  </div>
                  <span className={progress.isNearLimit ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
                    {isUnlimited 
                      ? 'Ilimitado' 
                      : `${limit.current}/${limit.limit}`
                    }
                  </span>
                </div>
                
                {!isUnlimited && (
                  <Progress 
                    value={progress.percentage} 
                    className={`h-2 ${
                      progress.isOverLimit 
                        ? 'bg-red-100' 
                        : progress.isNearLimit 
                          ? 'bg-orange-100' 
                          : ''
                    }`}
                  />
                )}

                {progress.isNearLimit && !isUnlimited && (
                  <p className="text-xs text-orange-600">
                    {progress.isOverLimit 
                      ? 'Has alcanzado tu límite' 
                      : 'Te estás acercando a tu límite'
                    }
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detailed Usage (when expanded) */}
      {showDetails && (
        <Card className="p-6">
          <h4 className="font-medium mb-4">Detalles del Plan</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Plan Features */}
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                {getPlanIcon()}
                Tu Plan Actual
              </h5>
              
              <div className="space-y-2 text-sm">
                {isPro ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Conexiones ilimitadas
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Crear grupos ilimitados
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Crear eventos ilimitados
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Asistente de IA
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Analytics avanzados
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Hasta 100 conexiones
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Posts ilimitados
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Feed personalizado
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Sin creación de grupos
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Sin eventos
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Upgrade Options */}
            {!isPro && (
              <div>
                <h5 className="font-medium mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Mejora a Creator
                </h5>
                
                <div className="space-y-3">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-purple-800">Creator</span>
                      <span className="text-purple-600 font-bold">$9.99/mes</span>
                    </div>
                    <p className="text-sm text-purple-700 mb-3">
                      Desbloquea todo el potencial de H-Social
                    </p>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Zap className="w-4 h-4 mr-2" />
                      Mejorar ahora
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>🚀 Founders: GRATIS durante beta</p>
                    <p>💎 50% descuento vitalicio</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
