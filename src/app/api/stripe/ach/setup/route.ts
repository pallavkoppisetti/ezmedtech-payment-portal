import { getStripeServer, handleStripeError } from '@/lib/stripe/config';
import { NextRequest, NextResponse } from 'next/server';
import type { Stripe } from 'stripe';

// TypeScript interface for request body
interface ACHSetupRequestBody {
  customer_id: string;
  verification_method?: 'microdeposits' | 'instant';
  metadata?: Record<string, string>;
}

// TypeScript interface for the response
interface ACHSetupResponse {
  client_secret: string;
  setup_intent_id: string;
  mandate_text: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ACHSetupResponse | ErrorResponse>> {
  try {
    // Parse the request body
    const body: ACHSetupRequestBody = await request.json();

    // Validate required fields
    if (!body.customer_id) {
      return NextResponse.json({ error: 'customer_id is required' }, { status: 400 });
    }

    // Validate customer_id format (should be Stripe customer ID)
    if (!body.customer_id.startsWith('cus_')) {
      return NextResponse.json(
        { error: 'Invalid customer_id format. Must be a valid Stripe customer ID.' },
        { status: 400 }
      );
    }

    // Healthcare mandate text for ACH Direct Debit subscription billing
    const mandateText = `By providing your bank account information and confirming this payment, you authorize EZMedTech and Stripe, our payment service provider, to debit your bank account for subscription payments in accordance with their terms. You may cancel this authorization at any time by contacting us or your bank. This authorization will remain in effect until you cancel it. ACH transactions may take 3-5 business days to process.

For healthcare subscription billing, you agree to allow automated charges for your selected subscription plan. You will receive email notifications before each billing cycle. You may update your payment method or cancel your subscription at any time through your account dashboard.

This payment method will be securely stored and used for recurring subscription payments in compliance with healthcare data protection regulations including HIPAA.`;

    // Prepare SetupIntent parameters for ACH
    const setupIntentParams: Stripe.SetupIntentCreateParams = {
      customer: body.customer_id,
      payment_method_types: ['us_bank_account'],
      usage: 'off_session', // For future subscription payments
      payment_method_options: {
        us_bank_account: {
          verification_method: body.verification_method || 'microdeposits',
        },
      },
      mandate_data: {
        customer_acceptance: {
          type: 'online',
          online: {
            ip_address:
              request.headers.get('x-forwarded-for') ||
              request.headers.get('x-real-ip') ||
              '127.0.0.1',
            user_agent: request.headers.get('user-agent') || 'Unknown',
          },
        },
      },
      metadata: {
        purpose: 'ach_setup_healthcare_subscription',
        payment_type: 'ach_subscription',
        created_at: new Date().toISOString(),
        ...body.metadata,
      },
      description: 'Setup ACH payment method for healthcare subscription billing',
    };

    // Create the SetupIntent
    const stripe = await getStripeServer();
    const setupIntent = await stripe.setupIntents.create(setupIntentParams);

    // Validate that we got a client_secret back
    if (!setupIntent.client_secret) {
      throw new Error('Failed to create ACH SetupIntent: No client_secret returned');
    }

    // Return the SetupIntent client_secret and mandate information
    return NextResponse.json(
      {
        client_secret: setupIntent.client_secret,
        setup_intent_id: setupIntent.id,
        mandate_text: mandateText,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the error for debugging
    console.error('Stripe ACH SetupIntent creation failed:', error);

    // Handle Stripe-specific errors
    const errorMessage = handleStripeError(error);

    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to create ACH SetupIntent',
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
    { error: 'Method not allowed. Use POST to create an ACH SetupIntent.' },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create an ACH SetupIntent.' },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create an ACH SetupIntent.' },
    { status: 405 }
  );
}

export async function PATCH(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create an ACH SetupIntent.' },
    { status: 405 }
  );
}
