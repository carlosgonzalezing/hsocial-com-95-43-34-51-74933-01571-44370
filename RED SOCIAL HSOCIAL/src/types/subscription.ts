export interface UserSubscription {
  plan: 'starter' | 'creator';
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  isFounder: boolean;
  trialEnd?: string;
  subscriptionId?: string;
  stripeCustomerId?: string;
  cancelAtPeriodEnd?: boolean;
  renewsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: 'starter' | 'creator';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    connections: number;
    groups: number;
    events: number;
    aiGenerations: number;
  };
  isPopular?: boolean;
  discount?: {
    percentage: number;
    description: string;
  };
}

export interface FeatureLimits {
  connections: {
    current: number;
    limit: number;
    canUpgrade: boolean;
  };
  groups: {
    current: number;
    limit: number;
    canUpgrade: boolean;
  };
  events: {
    current: number;
    limit: number;
    canUpgrade: boolean;
  };
  aiGenerations: {
    current: number;
    limit: number;
    canUpgrade: boolean;
  };
}

export interface PricingTier {
  name: string;
  description: string;
  price: string;
  priceNumeric: number;
  features: {
    included: string[];
    excluded: string[];
  };
  cta: string;
  popular?: boolean;
  badge?: string;
}
