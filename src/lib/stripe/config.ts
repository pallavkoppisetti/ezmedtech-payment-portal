import { Stripe, loadStripe } from '@stripe/stripe-js';
import StripeServer from 'stripe';

// Environment detection
const isServer = typeof window === 'undefined';

// Client-side validation (browser only)
const validateClientEnvironment = () => {
  if (isServer) return; // Skip validation on server

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. ' +
      'Please check your .env.local file and ensure the Stripe publishable key is properly configured.'
    );
  }

  if (!publishableKey.startsWith('pk_')) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with "pk_"');
  }

  // Check if using test keys in production (client-side)
  if (process.env.NODE_ENV === 'production' && publishableKey.includes('test')) {
    console.warn(
      '⚠️  WARNING: You are using Stripe test publishable key in production environment. ' +
      'Please ensure you are using live keys for production.'
    );
  }
};

// Server-side validation (server only)
const validateServerEnvironment = () => {
  if (!isServer) return; // Skip validation on client

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY. ' +
      'Please check your .env.local file and ensure the Stripe secret key is properly configured.'
    );
  }

  if (!secretKey.startsWith('sk_')) {
    throw new Error('STRIPE_SECRET_KEY must start with "sk_"');
  }

  // Check if using test keys in production (server-side)
  if (process.env.NODE_ENV === 'production' && secretKey.includes('test')) {
    // Only warn once during startup, not during build
    if (process.env.NODE_ENV !== 'production' || !process.env.BUILDING) {
      console.warn(
        '⚠️  WARNING: You are using Stripe test secret key in production environment. ' +
        'Please ensure you are using live keys for production.'
      );
    }
  }
};

// Client-side Stripe instance (singleton pattern)
let stripeClientPromise: Promise<Stripe | null> | null = null;

export const getStripeClient = (): Promise<Stripe | null> => {
  if (isServer) {
    throw new Error('getStripeClient() should only be called on the client side');
  }

  if (!stripeClientPromise) {
    try {
      // Validate environment before creating client
      validateClientEnvironment();

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

// Server-side Stripe instance (singleton pattern)
let stripeServerInstance: StripeServer | null = null;

export const getStripeServer = (): StripeServer => {
  if (!isServer) {
    throw new Error('getStripeServer() should only be called on the server side');
  }

  if (!stripeServerInstance) {
    try {
      // Validate environment before creating server instance
      validateServerEnvironment();

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

// Conditional stripe instance that works on both client and server
export const stripe = (() => {
  if (isServer) {
    return getStripeServer();
  }
  // For client-side, we return a function that returns the promise
  // This avoids calling getStripeClient() during module initialization
  return null;
})();

// For client-side usage, provide a separate export
export const getStripe = () => {
  if (isServer) {
    return getStripeServer();
  }
  return getStripeClient();
};

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
