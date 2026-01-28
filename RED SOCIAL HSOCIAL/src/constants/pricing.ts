import { PricingTier } from '@/types/subscription';

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    description: 'Comienza tu viaje profesional. Conecta, comparte y descubre oportunidades.',
    price: 'Gratis',
    priceNumeric: 0,
    features: {
      included: [
        'Perfil completo con avatar y bio',
        'Posts ilimitados de texto e imágenes',
        'Feed personalizado básico',
        'Hasta 100 conexiones',
        'Mensajes básicos',
        'Ideas personales básicas',
        'Ver eventos de otros',
        'Soporte por comunidad'
      ],
      excluded: [
        'Creación de grupos',
        'Creación de eventos',
        'Asistente de IA',
        'Analytics del perfil',
        'Badge verificado',
        'Soporte prioritario'
      ]
    },
    cta: 'Comenzar Gratis'
  },
  {
    name: 'Creator',
    description: 'Transforma ideas en proyectos. Crea grupos, eventos y usa IA para potenciar tu carrera.',
    price: '$9.99/mes',
    priceNumeric: 9.99,
    popular: true,
    badge: '🚀 Founders: GRATIS durante beta',
    features: {
      included: [
        'Todo lo de Starter',
        'Conexiones ilimitadas',
        'Mensajes priorizados',
        'Ideas avanzadas y colaborativas',
        'Crear y gestionar grupos',
        'Crear y gestionar eventos',
        'Asistente de IA para contenido',
        'Analytics detallados del perfil',
        'Badge 👑 Founder verificado',
        'Soporte prioritario 24/7',
        'Personalización avanzada del perfil'
      ],
      excluded: []
    },
    cta: 'Unirse como Founder'
  }
];

export const FOUNDERS_BENEFITS = {
  title: '🚀 Programa Founders',
  description: 'Eres parte de los primeros usuarios moldeando el futuro de H-Social',
  benefits: [
    'Acceso completo GRATIS durante toda la beta',
    '50% descuento vitalicio cuando empecemos a cobrar',
    'Badge 👑 Founder exclusivo en tu perfil',
    'Acceso directo al equipo fundador',
    'Tu feedback implementa nuevas features',
    'Invita a colegas y gana más beneficios'
  ],
  urgency: 'Solo los primeros 100 usuarios serán Founders'
};

export const FEATURE_LIMITS = {
  starter: {
    connections: 100,
    groups: 0,
    events: 0,
    aiGenerations: 0
  },
  creator: {
    connections: -1, // ilimitado
    groups: -1,
    events: -1,
    aiGenerations: -1
  }
};
