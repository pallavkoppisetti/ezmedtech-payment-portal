import { getStripeServer, handleStripeError } from '@/lib/stripe/config';
import { getPricingTierById } from '@/lib/stripe/products';
import { NextRequest, NextResponse } from 'next/server';
import type { Stripe } from 'stripe';

/**
 * Stripe Checkout Session API Route
 *
 * Creates Stripe checkout sessions for subscription billing with support for:
 * - Credit/Debit Card payments
 * - ACH/Bank Account payments (US only)
 * - Combined payment method selection
 *
 * Supports both pricing tier IDs (e.g., 'professional') and direct Stripe price IDs.
 * Includes HIPAA-compliant metadata handling and healthcare-specific ACH mandates.
 */

// TypeScript interfaces for type safety and API documentation
interface CheckoutRequestBody {
  /** Stripe price ID or tier ID (e.g., 'professional') */
  priceId: string;
  /** Optional existing Stripe customer ID */
  customerId?: string;
  /** Customer email for new customer creation */
  customerEmail?: string;
  /** Payment method preference: 'card' | 'ach' | 'both' (default: 'both') */
  payment_method_type?: 'card' | 'ach' | 'both';
  /** Additional metadata to attach to the session and subscription */
  metadata?: Record<string, string>;
}

interface CheckoutResponse {
  /** Stripe checkout session URL for redirection */
  url: string;
  /** Stripe checkout session ID for tracking */
  sessionId: string;
}

interface ErrorResponse {
  /** Error message for display to user */
  error: string;
  /** Detailed error information for debugging */
  details?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CheckoutResponse | ErrorResponse>> {
  try {
    // Parse the request body
    const body: CheckoutRequestBody = await request.json();

    // Validate required fields
    if (!body.priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    // Determine billing cycle from request (default to monthly)
    const billingCycle = (body as any).billingCycle || 'monthly';

    // Map tier ID to Stripe price ID if needed
    let actualPriceId = body.priceId;

    // Check if the priceId is a tier ID (like 'professional') rather than a Stripe price ID
    if (!body.priceId.startsWith('price_')) {
      const tier = getPricingTierById(body.priceId);

      if (!tier) {
        return NextResponse.json(
          { error: `Invalid pricing tier: ${body.priceId}` },
          { status: 400 }
        );
      }

      if (!tier.stripePriceId) {
        return NextResponse.json(
          { error: `Stripe price ID not configured for tier: ${body.priceId}` },
          { status: 500 }
        );
      }

      // Get the appropriate price ID based on billing cycle
      if (billingCycle === 'yearly' && tier.stripePriceId.yearly) {
        actualPriceId = tier.stripePriceId.yearly;
      } else if (tier.stripePriceId.monthly) {
        actualPriceId = tier.stripePriceId.monthly;
      } else {
        return NextResponse.json(
          {
            error: `Stripe price ID not available for ${billingCycle} billing on tier: ${body.priceId}`,
          },
          { status: 500 }
        );
      }
    }

    // Validate payment_method_type if provided
    if (body.payment_method_type && !['card', 'ach', 'both'].includes(body.payment_method_type)) {
      return NextResponse.json(
        { error: 'payment_method_type must be "card", "ach", or "both"' },
        { status: 400 }
      );
    }

    // Configuration: URLs and payment methods
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentMethodType = body.payment_method_type || 'both';

    // Map payment method preferences to Stripe payment method types
    const getPaymentMethodTypes = (
      type: string
    ): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] => {
      switch (type) {
        case 'ach':
          return ['us_bank_account'];
        case 'card':
          return ['card'];
        case 'both':
        default:
          return ['card', 'us_bank_account']; // Default: offer both options
      }
    };

    const paymentMethodTypes = getPaymentMethodTypes(paymentMethodType);

    // HIPAA-compliant ACH mandate text for healthcare subscription billing
    const ACH_MANDATE_TEXT = `By providing your bank account information and confirming this payment, you authorize EZMedTech and Stripe, our payment service provider, to debit your bank account for subscription payments in accordance with their terms. You may cancel this authorization at any time by contacting us or your bank. This authorization will remain in effect until you cancel it. ACH transactions may take 3-5 business days to process.

For healthcare subscription billing, you agree to allow automated charges for your selected subscription plan. You will receive email notifications before each billing cycle. You may update your payment method or cancel your subscription at any time through your account dashboard.

This payment method will be securely stored and used for recurring subscription payments in compliance with healthcare data protection regulations including HIPAA.`;

    // Create base checkout session configuration
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price: actualPriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
      allow_promotion_codes: true,

      // Subscription metadata for tracking and compliance
      subscription_data: {
        metadata: {
          ...body.metadata,
          payment_method_type: paymentMethodType,
          created_at: new Date().toISOString(),
          ach_enabled: (paymentMethodType === 'ach' || paymentMethodType === 'both').toString(),
        },
      },

      // Session metadata for tracking
      metadata: {
        ...body.metadata,
        payment_method_type: paymentMethodType,
        created_at: new Date().toISOString(),
      },
    };

    // Configure ACH-specific settings when bank account payments are enabled
    const isACHEnabled = paymentMethodType === 'ach' || paymentMethodType === 'both';
    if (isACHEnabled) {
      sessionParams.payment_method_collection = 'if_required';
      sessionParams.payment_method_options = {
        us_bank_account: {
          verification_method: 'automatic', // Stripe handles verification automatically
        },
      };

      // Add HIPAA-compliant authorization text for ACH payments
      sessionParams.custom_text = {
        submit: {
          message:
            'By continuing, you authorize EZMedTech to charge your selected payment method for your subscription.',
        },
      };
    }

    // Configure customer handling
    if (body.customerId) {
      // Associate with existing Stripe customer
      sessionParams.customer = body.customerId;
    } else if (body.customerEmail) {
      // Create new customer or find existing by email
      sessionParams.customer_email = body.customerEmail;
    }
    // Note: Customer creation is automatic for subscription mode when customer_email is provided

    // Create the Stripe checkout session
    const stripe = await getStripeServer();
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Validate session creation
    if (!session.url) {
      throw new Error('Stripe checkout session creation failed: No redirect URL provided');
    }

    // Return successful response with checkout URL
    return NextResponse.json(
      {
        url: session.url,
        sessionId: session.id,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (exclude sensitive data)
    console.error('Stripe checkout session creation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    // Use centralized Stripe error handling
    const errorMessage = handleStripeError(error);

    // Return standardized error response
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods with descriptive error messages
 */
const methodNotAllowed = (method: string): NextResponse<ErrorResponse> => {
  return NextResponse.json(
    { error: `Method ${method} not allowed. Use POST to create a checkout session.` },
    { status: 405 }
  );
};

export async function GET(): Promise<NextResponse<ErrorResponse>> {
  return methodNotAllowed('GET');
}

export async function PUT(): Promise<NextResponse<ErrorResponse>> {
  return methodNotAllowed('PUT');
}

export async function DELETE(): Promise<NextResponse<ErrorResponse>> {
  return methodNotAllowed('DELETE');
}

export async function PATCH(): Promise<NextResponse<ErrorResponse>> {
  return methodNotAllowed('PATCH');
}
