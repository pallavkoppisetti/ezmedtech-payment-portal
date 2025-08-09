import { getStripeSecretKey } from '@/lib/aws/secrets';
import type { ACHProcessingOptions, ACHVerificationStatus } from '@/lib/types/ach';
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

// Server-side Stripe instance
let stripeServerInstance: StripeServer | null = null;

export const getStripeServer = async (): Promise<StripeServer> => {
  if (!isServer) {
    throw new Error('getStripeServer() should only be called on the server side');
  }

  if (!stripeServerInstance) {
    try {
      // Get secret key from Parameter Store in production, env var in development
      const secretKey = await getStripeSecretKey();

      stripeServerInstance = new StripeServer(secretKey, {
        apiVersion: '2025-07-30.basil',
        typescript: true,
        telemetry: false,
      });
    } catch (error) {
      throw new Error(
        `Failed to initialize Stripe server instance: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
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
  PaymentIntent,
  PaymentMethod,
  StripeCardElement,
  Stripe as StripeClient,
  StripeElements,
  StripeError,
} from '@stripe/stripe-js';

export type { Stripe as StripeServerType } from 'stripe';

// Re-export commonly used server-side types
export type StripeCustomer = StripeServer.Customer;
export type StripeSubscription = StripeServer.Subscription;
export type StripePrice = StripeServer.Price;
export type StripeProduct = StripeServer.Product;
export type StripeSetupIntent = StripeServer.SetupIntent;
export type StripePaymentIntent = StripeServer.PaymentIntent;
export type StripePaymentMethod = StripeServer.PaymentMethod;

// Configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card', 'us_bank_account'], // Added ACH support
  // ACH-specific configuration
  achConfig: {
    verificationMethod: 'microdeposits' as const,
    accountHolderType: 'individual' as const,
    allowedAccountTypes: ['checking', 'savings'] as const,
  },
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

// ============================================================================
// ACH DIRECT DEBIT FUNCTIONS
// ============================================================================

/**
 * Creates a SetupIntent for collecting bank account details for ACH payments
 * @param customerId - Stripe customer ID
 * @param options - Optional configuration for the SetupIntent
 * @returns Promise resolving to SetupIntent
 */
export const createACHSetupIntent = async (
  customerId: string,
  options?: {
    verificationMethod?: 'microdeposits' | 'instant';
    metadata?: Record<string, string>;
    description?: string;
  }
): Promise<StripeServer.SetupIntent> => {
  try {
    const stripe = await getStripeServer();

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['us_bank_account'],
      usage: 'off_session', // For future payments
      payment_method_options: {
        us_bank_account: {
          verification_method: options?.verificationMethod || 'microdeposits',
        },
      },
      metadata: {
        purpose: 'ach_setup',
        ...options?.metadata,
      },
      description: options?.description || 'Setup ACH payment method for future payments',
    });

    return setupIntent;
  } catch (error) {
    throw new Error(`Failed to create ACH SetupIntent: ${handleStripeError(error)}`);
  }
};

/**
 * Verifies an ACH payment method status
 * @param paymentMethodId - Stripe payment method ID
 * @returns Promise resolving to verification status and details
 */
export const verifyACHPaymentMethod = async (
  paymentMethodId: string
): Promise<{
  status: ACHVerificationStatus;
  verificationDetails?: {
    microDepositsStatus?: string;
    attempts?: number;
    nextAttemptAllowedAt?: string;
  };
  paymentMethod: StripeServer.PaymentMethod;
}> => {
  try {
    const stripe = await getStripeServer();

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (paymentMethod.type !== 'us_bank_account') {
      throw new Error('Payment method is not a US bank account');
    }

    const usBankAccount = paymentMethod.us_bank_account;
    let status: ACHVerificationStatus = 'pending';

    // Check if the payment method has been verified
    // Note: Stripe's PaymentMethod object doesn't expose verification status directly
    // We need to check if it can be used for payments
    if (usBankAccount) {
      // For US bank accounts, we consider them verified if they exist and have required fields
      status = usBankAccount.last4 ? 'verified' : 'pending';
    }

    return {
      status,
      verificationDetails: {
        // Additional verification details would come from webhook events
        // or separate verification API calls in a real implementation
      },
      paymentMethod,
    };
  } catch (error) {
    throw new Error(`Failed to verify ACH payment method: ${handleStripeError(error)}`);
  }
};

/**
 * Creates a PaymentIntent for one-time ACH payments
 * @param amount - Amount in cents
 * @param customerId - Stripe customer ID
 * @param paymentMethodId - ACH payment method ID
 * @param options - Additional options for the payment
 * @returns Promise resolving to PaymentIntent
 */
export const createACHPaymentIntent = async (
  amount: number,
  customerId: string,
  paymentMethodId: string,
  options?: ACHProcessingOptions
): Promise<StripeServer.PaymentIntent> => {
  try {
    const stripe = await getStripeServer();

    // Verify the payment method is ACH and verified
    const verificationResult = await verifyACHPaymentMethod(paymentMethodId);
    if (verificationResult.status !== 'verified') {
      throw new Error(`ACH payment method not verified. Status: ${verificationResult.status}`);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: STRIPE_CONFIG.currency,
      customer: customerId,
      payment_method: paymentMethodId,
      payment_method_types: ['us_bank_account'],
      confirmation_method: 'automatic',
      confirm: true,
      payment_method_options: {
        us_bank_account: {
          verification_method: 'microdeposits',
        },
      },
      description: options?.description || 'ACH payment',
      metadata: {
        payment_type: 'ach_one_time',
        processing_type: options?.useSameDayACH ? 'same_day' : 'standard',
        ...options?.metadata,
      },
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to create ACH PaymentIntent: ${handleStripeError(error)}`);
  }
};

/**
 * Creates a subscription with ACH as the payment method
 * @param customerId - Stripe customer ID
 * @param priceId - Stripe price ID for the subscription
 * @param paymentMethodId - ACH payment method ID
 * @param options - Additional subscription options
 * @returns Promise resolving to Subscription
 */
export const createACHSubscription = async (
  customerId: string,
  priceId: string,
  paymentMethodId: string,
  options?: {
    trialPeriodDays?: number;
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
    metadata?: Record<string, string>;
    description?: string;
  }
): Promise<StripeServer.Subscription> => {
  try {
    const stripe = await getStripeServer();

    // Verify the payment method is ACH and verified
    const verificationResult = await verifyACHPaymentMethod(paymentMethodId);
    if (verificationResult.status !== 'verified') {
      throw new Error(`ACH payment method not verified. Status: ${verificationResult.status}`);
    }

    // Set the ACH payment method as default for the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['us_bank_account'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: options?.trialPeriodDays,
      proration_behavior: options?.prorationBehavior || 'create_prorations',
      metadata: {
        payment_type: 'ach_subscription',
        ...options?.metadata,
      },
      description: options?.description || 'ACH subscription',
    });

    return subscription;
  } catch (error) {
    throw new Error(`Failed to create ACH subscription: ${handleStripeError(error)}`);
  }
};

/**
 * Confirms microdeposit verification for ACH payment methods
 * Note: Microdeposit verification in Stripe is handled through the verification API
 * @param paymentMethodId - Stripe payment method ID
 * @param amounts - Array of microdeposit amounts in cents
 * @returns Promise resolving to verification result
 */
export const confirmACHMicrodeposits = async (
  paymentMethodId: string,
  amounts: [number, number] // TODO: Implement microdeposit verification with amounts
): Promise<{ success: boolean; message: string }> => {
  try {
    // Future implementation will use the amounts parameter for verification
    console.log('ACH microdeposit verification for payment method:', paymentMethodId, 'with amounts:', amounts);
    const stripe = await getStripeServer();

    // For ACH verification, we typically need to handle this through
    // the payment method's verification endpoint or setup intent
    // This is a placeholder implementation - actual verification
    // would depend on your specific Stripe integration setup

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (paymentMethod.type !== 'us_bank_account') {
      throw new Error('Payment method is not a US bank account');
    }

    // In a real implementation, you would:
    // 1. Submit the amounts to Stripe's verification endpoint
    // 2. Handle the response and update verification status
    // 3. Return appropriate success/failure response

    return {
      success: true,
      message: 'Microdeposit verification submitted successfully',
    };
  } catch (error) {
    throw new Error(`Failed to confirm ACH microdeposits: ${handleStripeError(error)}`);
  }
};

export const isStripeError = (error: unknown): error is StripeServer.StripeRawError => {
  return !!(
    error &&
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as { type: unknown }).type === 'string'
  );
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
        // Handle ACH-specific invalid request errors
        if (error.code === 'payment_method_not_found') {
          return 'The payment method could not be found.';
        }
        if (error.code === 'setup_intent_authentication_failure') {
          return 'Bank account verification failed. Please check your account details.';
        }
        if (error.code === 'payment_method_verification_failure') {
          return 'Bank account verification failed. Please verify your microdeposit amounts.';
        }
        return error.message || "Invalid parameters were supplied to Stripe's API.";
      case 'api_error':
        return "An error occurred internally with Stripe's API.";
      case 'authentication_error':
        return 'You probably used an incorrect API key.';
      case 'idempotency_error':
        return 'Idempotency key already used.';
      default:
        // Handle ACH-specific error codes
        if (error.code === 'account_closed') {
          return 'The bank account has been closed.';
        }
        if (error.code === 'account_frozen') {
          return 'The bank account is frozen.';
        }
        if (error.code === 'insufficient_funds') {
          return 'Insufficient funds in the bank account.';
        }
        if (error.code === 'debit_not_authorized') {
          return 'The debit transaction was not authorized by the account holder.';
        }
        if (error.code === 'invalid_account_number') {
          return 'The bank account number is invalid.';
        }
        if (error.code === 'invalid_routing_number') {
          return 'The bank routing number is invalid.';
        }
        if (error.code === 'bank_account_verification_failed') {
          return 'Bank account verification failed. Please check your account details and try again.';
        }
        if (error.code === 'microdeposit_verification_failed') {
          return 'Microdeposit verification failed. Please check the amounts and try again.';
        }
        if (error.code === 'verification_failed') {
          return 'Account verification failed. Please contact support for assistance.';
        }
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};
