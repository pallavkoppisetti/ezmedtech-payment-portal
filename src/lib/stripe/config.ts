import { Stripe, loadStripe } from '@stripe/stripe-js';
import StripeServer from 'stripe';

// Environment variable validation
const validateEnvironmentVariables = () => {
  const requiredEnvVars = [
    { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', value: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY },
    { key: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY }
  ];

  const missingVars = requiredEnvVars.filter(envVar => !envVar.value);

  if (missingVars.length > 0) {
    const missingKeys = missingVars.map(envVar => envVar.key).join(', ');
    throw new Error(
      `Missing required Stripe environment variables: ${missingKeys}. ` +
      'Please check your .env.local file and ensure all Stripe keys are properly configured.'
    );
  }

  // Validate key formats
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  const secretKey = process.env.STRIPE_SECRET_KEY!;

  if (!publishableKey.startsWith('pk_')) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with "pk_"');
  }

  if (!secretKey.startsWith('sk_')) {
    throw new Error('STRIPE_SECRET_KEY must start with "sk_"');
  }

  // Check if we're using test keys in production
  if (process.env.NODE_ENV === 'production') {
    if (publishableKey.includes('test') || secretKey.includes('test')) {
      console.warn(
        '⚠️  WARNING: You are using Stripe test keys in production environment. ' +
        'Please ensure you are using live keys for production.'
      );
    }
  }
};

// Validate environment variables on module load
validateEnvironmentVariables();

// Server-side Stripe instance
let stripeServerInstance: StripeServer | null = null;

export const getStripeServer = (): StripeServer => {
  if (!stripeServerInstance) {
    try {
      stripeServerInstance = new StripeServer(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-07-30.basil', // Use the latest stable API version
        typescript: true,
        telemetry: false, // Disable telemetry in production
      });
    } catch (error) {
      throw new Error(
        `Failed to initialize Stripe server instance: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  return stripeServerInstance;
};

// Client-side Stripe instance (singleton pattern)
let stripeClientPromise: Promise<Stripe | null> | null = null;

export const getStripeClient = (): Promise<Stripe | null> => {
  if (!stripeClientPromise) {
    try {
      stripeClientPromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
        // Optional: Configure Stripe.js options
        stripeAccount: undefined, // Set if using Stripe Connect
        locale: 'en', // Set default locale
      });
    } catch (error) {
      throw new Error(
        `Failed to load Stripe client: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  return stripeClientPromise;
};

// Export the server instance directly for convenience
export const stripe = getStripeServer();

// Export loadStripe function for client-side usage
export { loadStripe };

// Type definitions for common Stripe objects
export type {
  Stripe as StripeClient,
  StripeElements,
  StripeCardElement,
  StripeError,
  PaymentIntent,
  PaymentMethod,
} from '@stripe/stripe-js';

export type {
  Stripe as StripeServerType,
} from 'stripe';

// Re-export commonly used server-side types
export type StripeCustomer = StripeServer.Customer;
export type StripeSubscription = StripeServer.Subscription;
export type StripePrice = StripeServer.Price;
export type StripeProduct = StripeServer.Product;

// Configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card'],
  // Add other configuration options as needed
} as const;

// Utility functions
export const formatStripeAmount = (amount: number): number => {
  // Stripe expects amounts in cents
  return Math.round(amount * 100);
};

export const formatDisplayAmount = (amount: number, currency = 'usd'): string => {
  // Convert from cents to dollars and format for display
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

export const isStripeError = (error: unknown): error is StripeServer.StripeRawError => {
  return !!(error && 
    typeof error === 'object' && 
    error !== null && 
    'type' in error && 
    typeof (error as { type: unknown }).type === 'string');
};

// Error handling utility
export const handleStripeError = (error: unknown): string => {
  if (isStripeError(error)) {
    switch (error.type) {
      case 'card_error':
        return error.message || 'Your card was declined.';
      case 'rate_limit_error':
        return 'Too many requests made to the API too quickly.';
      case 'invalid_request_error':
        return 'Invalid parameters were supplied to Stripe\'s API.';
      case 'api_error':
        return 'An error occurred internally with Stripe\'s API.';
      case 'authentication_error':
        return 'You probably used an incorrect API key.';
      case 'idempotency_error':
        return 'Idempotency key already used.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};
