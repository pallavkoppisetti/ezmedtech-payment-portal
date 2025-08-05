import { formatStripeAmount } from './config';

// TypeScript interfaces for pricing tiers
export interface PricingFeature {
  name: string;
  description?: string;
  included: boolean;
  limit?: string | number;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number; // Price in dollars
    yearly?: number; // Optional yearly price in dollars
    stripeMonthlyAmount: number; // Price in cents for Stripe
    stripeYearlyAmount?: number; // Optional yearly price in cents for Stripe
  };
  features: PricingFeature[];
  popular?: boolean;
  stripePriceId?: {
    monthly: string;
    yearly?: string;
  };
  stripeProductId?: string;
  maxPatients: number | 'unlimited';
  supportLevel: 'email' | 'priority' | '24/7';
  analytics: 'basic' | 'advanced' | 'custom';
  apiAccess: boolean;
  customIntegrations: boolean;
  whiteLabel: boolean;
}

// Define the pricing tiers
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for small practices getting started with digital patient management',
    price: {
      monthly: 29,
      yearly: 24, // $24/month when billed yearly ($288/year)
      stripeMonthlyAmount: formatStripeAmount(29),
      stripeYearlyAmount: formatStripeAmount(288),
    },
    maxPatients: 100,
    supportLevel: 'email',
    analytics: 'basic',
    apiAccess: false,
    customIntegrations: false,
    whiteLabel: false,
    features: [
      {
        name: 'Up to 100 patients',
        description: 'Store and manage up to 100 patient records',
        included: true,
        limit: 100,
      },
      {
        name: 'Basic reporting',
        description: 'Essential reports and analytics for your practice',
        included: true,
      },
      {
        name: 'Email support',
        description: 'Get help via email during business hours',
        included: true,
      },
      {
        name: 'Secure data storage',
        description: 'HIPAA-compliant cloud storage for all patient data',
        included: true,
      },
      {
        name: 'Mobile app access',
        description: 'Access your data on iOS and Android devices',
        included: true,
      },
      {
        name: 'API access',
        description: 'Programmatic access to your data',
        included: false,
      },
      {
        name: 'Advanced analytics',
        description: 'Detailed insights and custom reports',
        included: false,
      },
      {
        name: 'Priority support',
        description: 'Fast-track support with shorter response times',
        included: false,
      },
    ],
    // Stripe IDs - Actual Price IDs from Stripe dashboard
    stripePriceId: {
      monthly: 'price_1RsbiV3knPyAFyt5jhMDdEUI', // Basic monthly price
      // yearly: 'price_basic_yearly', // Yearly pricing not yet configured
    },
    stripeProductId: 'prod_basic', // Replace with actual Stripe product ID
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing practices that need advanced features and analytics',
    price: {
      monthly: 79,
      yearly: 65, // $65/month when billed yearly ($780/year)
      stripeMonthlyAmount: formatStripeAmount(79),
      stripeYearlyAmount: formatStripeAmount(780),
    },
    maxPatients: 1000,
    supportLevel: 'priority',
    analytics: 'advanced',
    apiAccess: true,
    customIntegrations: false,
    whiteLabel: false,
    popular: true, // Mark as most popular
    features: [
      {
        name: 'Up to 1,000 patients',
        description: 'Store and manage up to 1,000 patient records',
        included: true,
        limit: 1000,
      },
      {
        name: 'Advanced analytics',
        description: 'Detailed insights, custom reports, and data visualization',
        included: true,
      },
      {
        name: 'Priority support',
        description: 'Fast-track support with 24-hour response time',
        included: true,
      },
      {
        name: 'API access',
        description: 'Full REST API access for integrations',
        included: true,
      },
      {
        name: 'Secure data storage',
        description: 'HIPAA-compliant cloud storage for all patient data',
        included: true,
      },
      {
        name: 'Mobile app access',
        description: 'Access your data on iOS and Android devices',
        included: true,
      },
      {
        name: 'Basic reporting',
        description: 'All basic reports included',
        included: true,
      },
      {
        name: 'Custom integrations',
        description: 'Integrate with your existing practice management software',
        included: false,
      },
      {
        name: 'White-label options',
        description: 'Customize the platform with your branding',
        included: false,
      },
    ],
    stripePriceId: {
      monthly: 'price_1Rsbj73knPyAFyt5qcAlh8Lw', // Professional monthly price
      // yearly: 'price_professional_yearly', // Yearly pricing not yet configured
    },
    stripeProductId: 'prod_professional', // Replace with actual Stripe product ID
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for large practices and healthcare organizations',
    price: {
      monthly: 199,
      yearly: 165, // $165/month when billed yearly ($1,980/year)
      stripeMonthlyAmount: formatStripeAmount(199),
      stripeYearlyAmount: formatStripeAmount(1980),
    },
    maxPatients: 'unlimited',
    supportLevel: '24/7',
    analytics: 'custom',
    apiAccess: true,
    customIntegrations: true,
    whiteLabel: true,
    features: [
      {
        name: 'Unlimited patients',
        description: 'No limits on the number of patient records',
        included: true,
        limit: 'unlimited',
      },
      {
        name: 'Custom integrations',
        description: 'Seamlessly integrate with your existing systems',
        included: true,
      },
      {
        name: '24/7 support',
        description: 'Round-the-clock support with dedicated account manager',
        included: true,
      },
      {
        name: 'White-label options',
        description: 'Fully customize the platform with your branding',
        included: true,
      },
      {
        name: 'Advanced analytics',
        description: 'Custom dashboards and enterprise-grade reporting',
        included: true,
      },
      {
        name: 'API access',
        description: 'Full REST API access with higher rate limits',
        included: true,
      },
      {
        name: 'Secure data storage',
        description: 'HIPAA-compliant cloud storage with advanced security',
        included: true,
      },
      {
        name: 'Mobile app access',
        description: 'White-labeled mobile apps for your organization',
        included: true,
      },
      {
        name: 'Basic reporting',
        description: 'All basic and advanced reports included',
        included: true,
      },
      {
        name: 'SLA guarantee',
        description: '99.9% uptime guarantee with service level agreement',
        included: true,
      },
      {
        name: 'Data migration',
        description: 'Free data migration from your existing systems',
        included: true,
      },
    ],
    stripePriceId: {
      monthly: 'price_1RsbjW3knPyAFyt5uFXrBBw1', // Enterprise monthly price
      // yearly: 'price_enterprise_yearly', // Yearly pricing not yet configured
    },
    stripeProductId: 'prod_enterprise', // Replace with actual Stripe product ID
  },
];

// Utility functions for working with pricing tiers
export const getPricingTierById = (id: string): PricingTier | undefined => {
  return PRICING_TIERS.find(tier => tier.id === id);
};

export const getPricingTierByStripeProductId = (productId: string): PricingTier | undefined => {
  return PRICING_TIERS.find(tier => tier.stripeProductId === productId);
};

export const getPricingTierByStripePriceId = (priceId: string): PricingTier | undefined => {
  return PRICING_TIERS.find(tier => 
    tier.stripePriceId?.monthly === priceId || 
    tier.stripePriceId?.yearly === priceId
  );
};

export const getPopularTier = (): PricingTier | undefined => {
  return PRICING_TIERS.find(tier => tier.popular === true);
};

export const calculateYearlyDiscount = (tier: PricingTier): number => {
  if (!tier.price.yearly) return 0;
  const monthlyTotal = tier.price.monthly * 12;
  const yearlyPrice = tier.price.yearly * 12;
  return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
};

// Feature comparison helpers
export const getIncludedFeatures = (tier: PricingTier): PricingFeature[] => {
  return tier.features.filter(feature => feature.included);
};

export const getExcludedFeatures = (tier: PricingTier): PricingFeature[] => {
  return tier.features.filter(feature => !feature.included);
};

// Constants for easy access
export const TIER_IDS = {
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const;

export const SUPPORT_LEVELS = {
  EMAIL: 'email',
  PRIORITY: 'priority',
  FULL: '24/7',
} as const;

export const ANALYTICS_LEVELS = {
  BASIC: 'basic',
  ADVANCED: 'advanced',
  CUSTOM: 'custom',
} as const;

// Type exports for convenience
export type TierIds = typeof TIER_IDS[keyof typeof TIER_IDS];
export type SupportLevel = typeof SUPPORT_LEVELS[keyof typeof SUPPORT_LEVELS];
export type AnalyticsLevel = typeof ANALYTICS_LEVELS[keyof typeof ANALYTICS_LEVELS];
