'use client';

import { type PricingTier } from '@/lib/stripe/products';

// TypeScript interfaces for checkout functions
export interface CreateCheckoutSessionParams {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface CheckoutError {
  error: string;
  details?: string;
}

/**
 * Creates a Stripe checkout session for subscription billing
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResponse> {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to create checkout session');
    }

    return data as CheckoutSessionResponse;
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    throw error;
  }
}

/**
 * Redirects to Stripe checkout for a specific pricing tier
 */
export async function redirectToCheckout(
  tier: PricingTier,
  billingCycle: 'monthly' | 'yearly',
  options?: {
    customerId?: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }
): Promise<void> {
  try {
    // Get the appropriate price ID based on billing cycle
    const priceId = billingCycle === 'yearly' 
      ? tier.stripePriceId?.yearly 
      : tier.stripePriceId?.monthly;

    if (!priceId) {
      throw new Error(`No ${billingCycle} price ID found for ${tier.name} plan`);
    }

    // Create checkout session
    const { url } = await createCheckoutSession({
      priceId,
      customerId: options?.customerId,
      customerEmail: options?.customerEmail,
      metadata: {
        tierName: tier.name,
        tierId: tier.id,
        billingCycle,
        ...options?.metadata,
      },
    });

    // Redirect to Stripe checkout
    window.location.href = url;
  } catch (error) {
    console.error('Checkout redirect failed:', error);
    throw error;
  }
}

/**
 * Helper function to handle checkout with error handling and loading states
 */
export async function handleCheckoutWithToast(
  tier: PricingTier,
  billingCycle: 'monthly' | 'yearly',
  options?: {
    customerId?: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
    onLoading?: (loading: boolean) => void;
    onError?: (error: string) => void;
  }
): Promise<void> {
  try {
    // Set loading state
    options?.onLoading?.(true);

    // Redirect to checkout
    await redirectToCheckout(tier, billingCycle, options);
  } catch (error) {
    // Handle error
    const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout';
    options?.onError?.(errorMessage);
    
    // You can integrate with a toast library here
    console.error('Checkout error:', errorMessage);
  } finally {
    // Clear loading state
    options?.onLoading?.(false);
  }
}

/**
 * Utility to validate if a pricing tier has the required Stripe price IDs
 */
export function validateTierPricing(tier: PricingTier, billingCycle: 'monthly' | 'yearly'): boolean {
  if (billingCycle === 'yearly') {
    return !!tier.stripePriceId?.yearly;
  }
  return !!tier.stripePriceId?.monthly;
}

/**
 * Get the price ID for a specific tier and billing cycle
 */
export function getPriceId(tier: PricingTier, billingCycle: 'monthly' | 'yearly'): string | null {
  if (billingCycle === 'yearly') {
    return tier.stripePriceId?.yearly || null;
  }
  return tier.stripePriceId?.monthly || null;
}
