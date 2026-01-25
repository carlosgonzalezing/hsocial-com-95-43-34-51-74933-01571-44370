import { UserSubscription } from '@/types/subscription';

// Mock data para desarrollo - reemplazar con datos reales de la API
export const mockSubscription: UserSubscription = {
  plan: 'creator',
  status: 'active',
  isFounder: true,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días atrás
  updatedAt: new Date().toISOString()
};

export const mockUsage = {
  connections: 45,
  groups: 2,
  events: 1,
  aiGenerations: 15
};

// Funciones para interactuar con la API de suscripciones
export const subscriptionAPI = {
  // Obtener suscripción actual
  getCurrentSubscription: async (): Promise<UserSubscription> => {
    // En producción: GET /api/subscription/current
    return mockSubscription;
  },

  // Obtener límites de uso
  getUsageLimits: async () => {
    // En producción: GET /api/subscription/usage
    return mockUsage;
  },

  // Actualizar plan
  updatePlan: async (plan: 'starter' | 'creator'): Promise<UserSubscription> => {
    // En producción: POST /api/subscription/update-plan
    return {
      ...mockSubscription,
      plan,
      updatedAt: new Date().toISOString()
    };
  },

  // Solicitar acceso Founder
  requestFounderAccess: async (data: {
    name: string;
    email: string;
    reason: string;
    features: string[];
  }) => {
    // En producción: POST /api/founder/request
    return { success: true, message: 'Solicitud enviada correctamente' };
  },

  // Cancelar suscripción
  cancelSubscription: async (): Promise<UserSubscription> => {
    // En producción: POST /api/subscription/cancel
    return {
      ...mockSubscription,
      status: 'canceled',
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString()
    };
  }
};

// Utilidades para manejar suscripciones
export const subscriptionUtils = {
  // Verificar si un usuario puede usar una feature
  canUseFeature: (subscription: UserSubscription, feature: string): boolean => {
    if (subscription.plan === 'creator' && subscription.isFounder) {
      return true; // Founders tienen acceso a todo durante beta
    }
    
    if (subscription.plan === 'creator') {
      return true; // Pro users tienen acceso a todo
    }
    
    // Starter users - definir qué features pueden usar
    const starterFeatures = ['posts', 'basic_feed', 'limited_connections'];
    return starterFeatures.includes(feature);
  },

  // Calcular días restantes de beta
  getBetaDaysRemaining: (createdAt: string): number => {
    const betaDuration = 90; // 90 días de beta
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, betaDuration - daysSinceCreation);
  },

  // Formatear estado de suscripción
  formatSubscriptionStatus: (status: string): string => {
    const statusMap: Record<string, string> = {
      'active': 'Activa',
      'trialing': 'En prueba',
      'canceled': 'Cancelada',
      'past_due': 'Vencida'
    };
    return statusMap[status] || status;
  },

  // Obtener precio con descuento Founder
  getFounderPrice: (regularPrice: number): number => {
    return regularPrice * 0.5; // 50% descuento
  }
};
