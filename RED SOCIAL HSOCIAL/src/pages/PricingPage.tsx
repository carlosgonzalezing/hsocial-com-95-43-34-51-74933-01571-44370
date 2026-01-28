import { useState } from 'react';
import { PricingSection } from '@/components/pricing/PricingSection';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { UsageLimits } from '@/components/subscription/UsageLimits';
import { FounderAccessRequest } from '@/components/subscription/FounderAccessRequest';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, CreditCard, BarChart3, Users, Star } from 'lucide-react';

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState('pricing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <h1 className="text-xl font-bold">H-Social</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => window.history.back()}>
                Volver
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Crown className="w-4 h-4 mr-2" />
                Ser Founder
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Elige tu plan en{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              H-Social
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Conecta, colabora y crece profesionalmente
          </p>
          
          {/* Founder Banner */}
          <Card className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Crown className="w-6 h-6" />
              <span className="text-2xl font-bold">Programa Founders</span>
              <Crown className="w-6 h-6" />
            </div>
            <p className="text-lg mb-4">
              Sé parte de los primeros 100 usuarios moldeando el futuro de H-Social
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>Acceso GRATIS durante beta</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>50% descuento vitalicio</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>Badge 👑 exclusivo</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Precios
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Mi Plan
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Uso
            </TabsTrigger>
            <TabsTrigger value="founder" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Founder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-8">
            <PricingSection 
              onPlanSelect={(plan) => {
                console.log('Plan selected:', plan);
                // Aquí iría la lógica de upgrade
              }}
            />
          </TabsContent>

          <TabsContent value="status" className="space-y-8">
            <SubscriptionStatus />
          </TabsContent>

          <TabsContent value="usage" className="space-y-8">
            <UsageLimits />
          </TabsContent>

          <TabsContent value="founder" className="space-y-8">
            <FounderAccessRequest />
          </TabsContent>
        </Tabs>

        {/* FAQ Section */}
        <Card className="p-8 mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Preguntas Frecuentes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">¿Qué es el Programa Founders?</h3>
              <p className="text-sm text-muted-foreground">
                Es un programa exclusivo para los primeros 100 usuarios que obtienen acceso completo GRATIS 
                durante la beta y beneficios especiales de por vida.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">¿Cuándo empezará a cobrar?</h3>
              <p className="text-sm text-muted-foreground">
                Planeamos empezar a cobrar en 6 meses cuando la plataforma esté más desarrollada. 
                Los founders siempre tendrán 50% descuento.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">¿Puedo cancelar cuando quiera?</h3>
              <p className="text-sm text-muted-foreground">
                Sí, puedes cancelar tu suscripción en cualquier momento. No hay penalizaciones ni contratos largos.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">¿Qué incluye el plan Creator?</h3>
              <p className="text-sm text-muted-foreground">
                Acceso ilimitado a todas las features: grupos, eventos, IA, analytics, 
                conexiones ilimitadas y soporte prioritario.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
