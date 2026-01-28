import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Calendar, Brain, AlertCircle, TrendingUp } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export function UsageLimits() {
  const { limits, isPro, isFounder, remainingDays } = useSubscription();
  const [showAlerts, setShowAlerts] = useState(true);

  const getLimitStatus = (current: number, limit: number) => {
    if (limit === -1) {
      return {
        percentage: 0,
        status: 'unlimited' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        message: 'Ilimitado'
      };
    }

    const percentage = (current / limit) * 100;
    
    if (percentage >= 100) {
      return {
        percentage,
        status: 'exceeded' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        message: 'Límite alcanzado'
      };
    }
    
    if (percentage >= 80) {
      return {
        percentage,
        status: 'warning' as const,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        message: 'Cerca del límite'
      };
    }
    
    if (percentage >= 50) {
      return {
        percentage,
        status: 'moderate' as const,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        message: 'Uso moderado'
      };
    }
    
    return {
      percentage,
      status: 'good' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      message: 'Buen uso'
    };
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'connections': return <Users className="w-5 h-5" />;
      case 'groups': return <Users className="w-5 h-5" />;
      case 'events': return <Calendar className="w-5 h-5" />;
      case 'aiGenerations': return <Brain className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'connections': return 'Conexiones';
      case 'groups': return 'Grupos creados';
      case 'events': return 'Eventos creados';
      case 'aiGenerations': return 'Generaciones IA';
      default: return feature;
    };
  };

  const hasWarnings = Object.values(limits).some(limit => 
    limit.limit !== -1 && (limit.current / limit.limit) >= 0.8
  );

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {hasWarnings && showAlerts && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-orange-800 mb-1">
                Acercándote a tus límites
              </h4>
              <p className="text-sm text-orange-700 mb-3">
                Algunas características están cerca de alcanzar su límite. 
                {isFounder 
                  ? ` Como Founder, puedes solicitar más capacidad durante la beta (${remainingDays} días restantes).`
                  : ' Considera mejorar a Creator para continuar creciendo sin límites.'
                }
              </p>
              <div className="flex gap-2">
                {isFounder ? (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Crown className="w-4 h-4 mr-2" />
                    Solicitar más capacidad
                  </Button>
                ) : (
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Mejorar a Creator
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowAlerts(false)}
                >
                  Ocultar
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(limits).map(([key, limit]) => {
          const status = getLimitStatus(limit.current, limit.limit);
          const isUnlimited = limit.limit === -1;

          return (
            <Card key={key} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${status.bgColor}`}>
                    {getFeatureIcon(key)}
                  </div>
                  <div>
                    <h4 className="font-medium">{getFeatureName(key)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {isUnlimited 
                        ? 'Sin límites' 
                        : `${limit.current} de ${limit.limit} usados`
                      }
                    </p>
                  </div>
                </div>
                
                <Badge 
                  className={`${status.bgColor} ${status.color} border-0`}
                  variant="secondary"
                >
                  {status.message}
                </Badge>
              </div>

              {!isUnlimited && (
                <div className="space-y-2">
                  <Progress 
                    value={status.percentage} 
                    className={`h-2 ${
                      status.status === 'exceeded' 
                        ? 'bg-red-100' 
                        : status.status === 'warning' 
                          ? 'bg-orange-100' 
                          : ''
                    }`}
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(status.percentage)}% utilizado</span>
                    <span>{limit.limit - limit.current} restantes</span>
                  </div>

                  {status.status === 'exceeded' && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-xs text-red-700">
                        Has alcanzado el límite. {isFounder 
                          ? 'Solicita más capacidad como Founder.'
                          : 'Mejora a Creator para continuar.'
                        }
                      </p>
                    </div>
                  )}

                  {status.status === 'warning' && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-2">
                      <p className="text-xs text-orange-700">
                        Te quedan {limit.limit - limit.current} usos. 
                        {isFounder 
                          ? ' Solicita más capacidad antes de llegar al límite.'
                          : 'Considera mejorar a Creator.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {isUnlimited && (
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-xs text-green-700">
                    {isFounder 
                      ? 'Acceso ilimitado como Founder durante la beta'
                      : 'Acceso ilimitado con plan Creator'
                    }
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="p-6">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Resumen de Uso
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {limits.connections.current}
            </div>
            <div className="text-sm text-muted-foreground">Conexiones</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {limits.groups.current}
            </div>
            <div className="text-sm text-muted-foreground">Grupos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {limits.events.current}
            </div>
            <div className="text-sm text-muted-foreground">Eventos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {limits.aiGenerations.current}
            </div>
            <div className="text-sm text-muted-foreground">IA Usos</div>
          </div>
        </div>

        {isFounder && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <Crown className="w-4 h-4" />
              <span>Acceso Founder activo • {remainingDays} días restantes</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
