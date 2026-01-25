import PricingPage from '@/pages/PricingPage';
import { LazyWrapper, LazyPricingSection, LazySubscriptionStatus } from '@/components/lazy/LazyComponents';
import { OptimizedImage } from '@/components/performance/OptimizedComponents';
import { useIntersectionObserver } from '@/hooks/usePerformance';
import { prefetchResources, preloadCriticalResources } from '@/utils/optimization';
import { useEffect, useRef } from 'react';

// Página de pricing optimizada con lazy loading
export default function OptimizedPricingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const { isIntersecting: heroVisible } = useIntersectionObserver(heroRef);
  const { isIntersecting: pricingVisible } = useIntersectionObserver(pricingRef);

  // Prefetch recursos cuando el usuario interactúa
  useEffect(() => {
    const handleUserInteraction = () => {
      // Prefetch componentes pesados
      prefetchResources([
        '/api/pricing',
        '/api/subscription/status'
      ]);
      
      // Remover listener después de primera interacción
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('scroll', handleUserInteraction, { once: true });
  }, []);

  // Preload recursos críticos inmediatamente
  useEffect(() => {
    preloadCriticalResources([
      '/images/hero-bg.webp',
      '/images/pricing-bg.webp'
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section - Siempre visible */}
      <div ref={heroRef} className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <h1 className="text-xl font-bold">H-Social</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Volver
              </button>
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105">
                👑 Ser Founder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section con lazy loading de imágenes */}
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
          
          {/* Founder Banner con imagen optimizada */}
          <div className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-2xl">👑</span>
              <span className="text-2xl font-bold">Programa Founders</span>
              <span className="text-2xl">👑</span>
            </div>
            <p className="text-lg mb-4">
              Sé parte de los primeros 100 usuarios moldeando el futuro de H-Social
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-yellow-300">⭐</span>
                <span>Acceso GRATIS durante beta</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-300">⭐</span>
                <span>50% descuento vitalicio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-300">⭐</span>
                <span>Badge 👑 exclusivo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section - Lazy loaded cuando es visible */}
        <div ref={pricingRef}>
          {pricingVisible && (
            <LazyWrapper>
              <LazyPricingSection 
                onPlanSelect={(plan) => {
                  console.log('Plan selected:', plan);
                  // Aquí iría la lógica de upgrade
                }}
              />
            </LazyWrapper>
          )}
        </div>

        {/* Features Grid - Optimizado con memoización */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            {
              icon: '🚀',
              title: 'Rápido y Ligero',
              description: 'Optimizado para velocidad máxima con lazy loading y virtual scrolling.'
            },
            {
              icon: '💎',
              title: 'Premium Features',
              description: 'Acceso a IA, analytics avanzados y herramientas colaborativas.'
            },
            {
              icon: '👑',
              title: 'Founder Benefits',
              description: 'Únete al programa exclusivo y obtén beneficios de por vida.'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* FAQ Section - Lazy loaded */}
        <div className="mt-16">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Preguntas Frecuentes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  q: '¿Qué es el Programa Founders?',
                  a: 'Es un programa exclusivo para los primeros 100 usuarios que obtienen acceso completo GRATIS durante la beta y beneficios especiales de por vida.'
                },
                {
                  q: '¿Cuándo empezará a cobrar?',
                  a: 'Planeamos empezar a cobrar en 6 meses cuando la plataforma esté más desarrollada. Los founders siempre tendrán 50% descuento.'
                },
                {
                  q: '¿Puedo cancelar cuando quiera?',
                  a: 'Sí, puedes cancelar tu suscripción en cualquier momento. No hay penalizaciones ni contratos largos.'
                },
                {
                  q: '¿Qué incluye el plan Creator?',
                  a: 'Acceso ilimitado a todas las features: grupos, eventos, IA, analytics, conexiones ilimitadas y soporte prioritario.'
                }
              ].map((faq, index) => (
                <div key={index}>
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
