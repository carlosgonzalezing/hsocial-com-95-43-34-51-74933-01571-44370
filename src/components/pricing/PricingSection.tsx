import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Zap, Users, Calendar, Brain, BarChart } from 'lucide-react';
import { PRICING_TIERS, FOUNDERS_BENEFITS } from '@/constants/pricing';
import { PricingTier } from '@/types/subscription';

interface PricingSectionProps {
  onPlanSelect?: (plan: 'starter' | 'creator') => void;
  currentPlan?: 'starter' | 'creator';
  isFounder?: boolean;
}

export function PricingSection({ onPlanSelect, currentPlan, isFounder = false }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');

  const handlePlanSelect = (planSlug: 'starter' | 'creator') => {
    if (onPlanSelect) {
      onPlanSelect(planSlug);
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('conex')) return <Users className="w-4 h-4" />;
    if (feature.includes('event')) return <Calendar className="w-4 h-4" />;
    if (feature.includes('IA') || feature.includes('intelig')) return <Brain className="w-4 h-4" />;
    if (feature.includes('Analytics') || feature.includes('estad')) return <BarChart className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Elige tu plan en H-Social
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Comienza gratis y escala cuando crezcas
        </p>
        
        {/* Founders Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-5 h-5" />
            <span className="font-bold text-lg">Programa Founders Activo</span>
            <Crown className="w-5 h-5" />
          </div>
          <p className="text-sm">
            {FOUNDERS_BENEFITS.urgency}
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {PRICING_TIERS.map((tier) => (
          <Card 
            key={tier.slug}
            className={`relative p-8 ${
              tier.popular 
                ? 'border-2 border-purple-500 shadow-lg scale-105' 
                : 'border border-gray-200'
            } ${
              currentPlan === tier.slug ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            {/* Popular Badge */}
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
                  <Zap className="w-3 h-3 mr-1" />
                  Más Popular
                </Badge>
              </div>
            )}

            {/* Founders Badge for Creator */}
            {tier.slug === 'creator' && (
              <div className="absolute -top-4 right-4">
                <Badge className="bg-green-600 text-white px-3 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Founders: GRATIS
                </Badge>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className="text-muted-foreground mb-4">{tier.description}</p>
              
              <div className="mb-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.priceNumeric > 0 && (
                  <span className="text-muted-foreground">/{billingCycle === 'year' ? 'año' : 'mes'}</span>
                )}
              </div>

              {/* Founder Special Note */}
              {tier.slug === 'creator' && isFounder && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800">
                    <Crown className="w-4 h-4 inline mr-1" />
                    ¡Ya eres Founder! Acceso gratuito durante beta
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {tier.features.included.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="text-green-600 mt-0.5">
                    {getFeatureIcon(feature)}
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}

              {tier.features.excluded.map((feature) => (
                <div key={feature} className="flex items-start gap-3 opacity-50">
                  <X className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-500">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button 
              onClick={() => handlePlanSelect(tier.slug as 'starter' | 'creator')}
              className={`w-full ${
                tier.popular 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                  : ''
              }`}
              variant={currentPlan === tier.slug ? 'outline' : 'default'}
              disabled={currentPlan === tier.slug}
            >
              {currentPlan === tier.slug ? 'Plan Actual' : tier.cta}
            </Button>
          </Card>
        ))}
      </div>

      {/* Founders Benefits Section */}
      <Card className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="text-center mb-6">
          <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{FOUNDERS_BENEFITS.title}</h2>
          <p className="text-muted-foreground">{FOUNDERS_BENEFITS.description}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {FOUNDERS_BENEFITS.benefits.map((benefit) => (
            <div key={benefit} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-orange-600 font-medium mb-4">
            {FOUNDERS_BENEFITS.urgency}
          </p>
          <Button 
            onClick={() => handlePlanSelect('creator')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Convertirme en Founder
          </Button>
        </div>
      </Card>
    </div>
  );
}
