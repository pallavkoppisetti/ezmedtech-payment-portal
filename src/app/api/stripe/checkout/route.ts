import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer, handleStripeError } from '@/lib/stripe/config';
import type { Stripe } from 'stripe';

// TypeScript interface for request body
interface CheckoutRequestBody {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
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

    // Get the base URL for redirect URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Prepare checkout session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
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
          created_at: new Date().toISOString(),
        },
      },
      metadata: {
        ...body.metadata,
        created_at: new Date().toISOString(),
      },
    };

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
