import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer, handleStripeError } from '@/lib/stripe/config';
import type { Stripe } from 'stripe';

// TypeScript interface for request body
interface CheckoutRequestBody {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
  payment_method_type?: 'card' | 'ach';
  metadata?: Record<string, string>;
}

// TypeScript interface for the response
interface CheckoutResponse {
  url: string;
  sessionId: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CheckoutResponse | ErrorResponse>> {
  try {
    // Parse the request body
    const body: CheckoutRequestBody = await request.json();
    
    // Validate required fields
    if (!body.priceId) {
      return NextResponse.json(
        { error: 'priceId is required' },
        { status: 400 }
      );
    }

    // Validate payment_method_type if provided
    if (body.payment_method_type && !['card', 'ach'].includes(body.payment_method_type)) {
      return NextResponse.json(
        { error: 'payment_method_type must be either "card" or "ach"' },
        { status: 400 }
      );
    }

    // Get the base URL for redirect URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Determine payment method types based on request
    const paymentMethodType = body.payment_method_type || 'card';
    const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = 
      paymentMethodType === 'ach' ? ['us_bank_account'] : ['card'];

    // ACH mandate text for healthcare subscription billing
    const achMandateText = `By providing your bank account information and confirming this payment, you authorize EZMedTech and Stripe, our payment service provider, to debit your bank account for subscription payments in accordance with their terms. You may cancel this authorization at any time by contacting us or your bank. This authorization will remain in effect until you cancel it. ACH transactions may take 3-5 business days to process.

For healthcare subscription billing, you agree to allow automated charges for your selected subscription plan. You will receive email notifications before each billing cycle. You may update your payment method or cancel your subscription at any time through your account dashboard.

This payment method will be securely stored and used for recurring subscription payments in compliance with healthcare data protection regulations including HIPAA.`;
    
    // Prepare checkout session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price: body.priceId,
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
      subscription_data: {
        metadata: {
          ...body.metadata,
          payment_method_type: paymentMethodType,
          created_at: new Date().toISOString(),
          // Include ACH mandate text in metadata for ACH payments
          ...(paymentMethodType === 'ach' && { ach_mandate_text: achMandateText }),
        },
      },
      metadata: {
        ...body.metadata,
        payment_method_type: paymentMethodType,
        created_at: new Date().toISOString(),
      },
    };

    // Add ACH-specific configuration
    if (paymentMethodType === 'ach') {
      sessionParams.payment_method_collection = 'if_required';
      sessionParams.payment_method_options = {
        us_bank_account: {
          verification_method: 'microdeposits' as any, // TypeScript workaround for Stripe types
        },
      };
    }

    // Handle customer creation or association
    if (body.customerId) {
      // Use existing customer
      sessionParams.customer = body.customerId;
    } else if (body.customerEmail) {
      // Create or use existing customer with this email
      sessionParams.customer_email = body.customerEmail;
    }
    // Note: For subscription mode, customer creation is automatic - no need to set customer_creation

    // Create the checkout session
    const stripe = await getStripeServer();
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Validate that we got a URL back
    if (!session.url) {
      throw new Error('Failed to create checkout session: No URL returned');
    }

    // Return the checkout session URL and ID
    return NextResponse.json(
      {
        url: session.url,
        sessionId: session.id,
      },
      { status: 200 }
    );

  } catch (error) {
    // Log the error for debugging
    console.error('Stripe checkout session creation failed:', error);

    // Handle Stripe-specific errors
    const errorMessage = handleStripeError(error);
    
    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to create checkout session',
          details: errorMessage,
        },
        { status: 500 }
      );
    }

    // Fallback for unknown errors
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: 'Please try again later',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported HTTP methods
export async function GET(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a checkout session.' },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a checkout session.' },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a checkout session.' },
    { status: 405 }
  );
}

export async function PATCH(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a checkout session.' },
    { status: 405 }
  );
}
