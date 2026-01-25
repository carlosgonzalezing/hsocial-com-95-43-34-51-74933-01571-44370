import { useState, useEffect } from 'react';
import { UserSubscription, FeatureLimits } from '@/types/subscription';
import { FEATURE_LIMITS } from '@/constants/pricing';

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  limits: FeatureLimits;
  isPro: boolean;
  isFounder: boolean;
  canUseFeature: (feature: keyof FeatureLimits) => boolean;
  upgradeRequired: (feature: keyof FeatureLimits) => boolean;
  remainingDays: number;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [currentUsage, setCurrentUsage] = useState({
    connections: 0,
    groups: 0,
    events: 0,
    aiGenerations: 0
  });

  useEffect(() => {
    // Simular carga de datos del usuario
    // En producción, esto vendría de tu API
    const mockSubscription: UserSubscription = {
      plan: 'creator',
      status: 'active',
      isFounder: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockUsage = {
      connections: 45,
      groups: 2,
      events: 1,
      aiGenerations: 15
    };

    setSubscription(mockSubscription);
    setCurrentUsage(mockUsage);
  }, []);

  const getLimits = (): FeatureLimits => {
    const planLimits = subscription 
      ? FEATURE_LIMITS[subscription.plan]
      : FEATURE_LIMITS.starter;

    return {
      connections: {
        current: currentUsage.connections,
        limit: planLimits.connections,
        canUpgrade: subscription?.plan !== 'creator'
      },
      groups: {
        current: currentUsage.groups,
        limit: planLimits.groups,
        canUpgrade: subscription?.plan !== 'creator'
      },
      events: {
        current: currentUsage.events,
        limit: planLimits.events,
        canUpgrade: subscription?.plan !== 'creator'
      },
      aiGenerations: {
        current: currentUsage.aiGenerations,
        limit: planLimits.aiGenerations,
        canUpgrade: subscription?.plan !== 'creator'
      }
    };
  };

  const canUseFeature = (feature: keyof FeatureLimits): boolean => {
    const limits = getLimits();
    const limit = limits[feature];
    
    // Si es ilimitado (-1) o está por debajo del límite
    return limit.limit === -1 || limit.current < limit.limit;
  };

  const upgradeRequired = (feature: keyof FeatureLimits): boolean => {
    const limits = getLimits();
    const limit = limits[feature];
    
    return limit.limit !== -1 && limit.current >= limit.limit;
  };

  const isPro = subscription?.plan === 'creator';
  const isFounder = subscription?.isFounder || false;

  // Calcular días restantes de beta (simulado: 90 días desde registro)
  const remainingDays = Math.max(0, 90 - Math.floor((Date.now() - new Date(subscription?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)));

  return {
    subscription,
    limits: getLimits(),
    isPro,
    isFounder,
    canUseFeature,
    upgradeRequired,
    remainingDays
  };
}
