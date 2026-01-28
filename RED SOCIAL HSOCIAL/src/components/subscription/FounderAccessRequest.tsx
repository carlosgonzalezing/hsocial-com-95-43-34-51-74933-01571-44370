import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Crown, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export function FounderAccessRequest() {
  const { isFounder, remainingDays } = useSubscription();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    features: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableFeatures = [
    { id: 'groups', name: 'Crear y gestionar grupos', description: 'Colabora en proyectos con tu equipo' },
    { id: 'events', name: 'Crear eventos', description: 'Organiza meetups y networking' },
    { id: 'ai', name: 'Asistente de IA', description: 'Genera contenido y análisis' },
    { id: 'analytics', name: 'Analytics avanzados', description: 'Métricas detalladas de tu perfil' },
    { id: 'unlimited_connections', name: 'Conexiones ilimitadas', description: 'Expande tu red sin límites' }
  ];

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío de solicitud
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h3>
        <p className="text-muted-foreground mb-6">
          Revisaremos tu solicitud y activaremos las features solicitadas en las próximas 24 horas.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <Crown className="w-4 h-4 inline mr-1" />
            Como Founder, tienes acceso prioritario durante la beta.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-8 h-8 text-purple-600" />
          <div>
            <h3 className="text-xl font-bold">Solicitar Acceso Founder</h3>
            <p className="text-muted-foreground">
              {isFounder 
                ? `Ya eres Founder • ${remainingDays} días restantes`
                : 'Solicita acceso especial durante la beta'
              }
            </p>
          </div>
        </div>

        {isFounder ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <Crown className="w-5 h-5" />
              <span className="font-medium">¡Eres Founder!</span>
            </div>
            <p className="text-sm text-green-700">
              Ya tienes acceso a todas las features durante la beta. 
              Usa este formulario para solicitar features adicionales o reportar problemas.
            </p>
          </div>
        ) : (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-800 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Programa Founders</span>
            </div>
            <p className="text-sm text-purple-700">
              Únete a los primeros 100 usuarios y obtén acceso completo GRATIS durante la beta,
              más 50% descuento vitalicio.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        {/* Feature Selection */}
        <div>
          <Label className="text-base font-medium mb-4 block">
            ¿Qué features te interesan más?
          </Label>
          <div className="space-y-3">
            {availableFeatures.map((feature) => (
              <div 
                key={feature.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  formData.features.includes(feature.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleFeatureToggle(feature.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                    formData.features.includes(feature.id)
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.features.includes(feature.id) && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div>
          <Label htmlFor="reason">¿Por qué quieres ser Founder?</Label>
          <Textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Cuéntanos cómo planeas usar H-Social y qué impacto esperas generar..."
            rows={4}
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isFounder 
              ? 'Responderemos en las próximas 24 horas'
              : 'Solo los primeros 100 usuarios serán aceptados'
            }
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {isFounder ? 'Enviar Solicitud' : 'Ser Founder'}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Benefits Reminder */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium mb-3">Beneficios del Programa Founders:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Acceso completo GRATIS durante beta</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>50% descuento vitalicio</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Badge 👑 Founder exclusivo</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Acceso directo al fundador</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
