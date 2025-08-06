import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer, handleStripeError } from '@/lib/stripe/config';
import { getPricingTierByStripePriceId } from '@/lib/stripe/products';
import type { Stripe } from 'stripe';

// TypeScript interfaces for response data
interface VerifySessionResponse {
  success: boolean;
  subscription?: {
    id: string;
    status: string;
    planName: string;
    amount: number;
    currency: string;
    interval: string;
    nextBillingDate: string;
    customerEmail: string;
    customerName?: string;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifySessionResponse | ErrorResponse>> {
  try {
    // Get session_id from query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing session_id parameter',
        },
        { status: 400 }
      );
    }

    // Validate session_id format
    if (!sessionId.startsWith('cs_')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session_id format',
        },
        { status: 400 }
      );
    }

    const stripe = getStripeServer();

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    // Verify the session was completed
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not completed',
          details: `Payment status: ${session.payment_status}`,
        },
        { status: 400 }
      );
    }

    // Get subscription details
    const subscription = session.subscription as Stripe.Subscription;
    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'No subscription found for this session',
        },
        { status: 400 }
      );
    }

    console.log('Subscription data:', {
      id: subscription.id,
      status: subscription.status,
      itemsCount: subscription.items.data.length,
      current_period_end: (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end
    });

    // Get the price details
    const priceItem = subscription.items.data[0];
    if (!priceItem) {
      return NextResponse.json(
        {
          success: false,
          error: 'No subscription items found',
        },
        { status: 400 }
      );
    }

    const price = priceItem.price;
    const priceId = price.id;

    // Get plan details from our pricing tiers
    const tier = getPricingTierByStripePriceId(priceId);
    const planName = tier ? tier.name : 'Unknown Plan';

    // Get customer details
    const customer = session.customer as Stripe.Customer;
    const customerEmail = customer?.email || session.customer_email || '';
    const customerName = customer?.name || undefined;

    // Calculate next billing date
    const subscriptionData = subscription as Stripe.Subscription & { current_period_end?: number };
    let nextBillingDate: string;
    
    if (subscriptionData.current_period_end && subscriptionData.current_period_end > 0) {
      nextBillingDate = new Date(subscriptionData.current_period_end * 1000).toISOString();
    } else {
      // Fallback: calculate next month from now
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextBillingDate = nextMonth.toISOString();
    }

    // Format amount (Stripe amounts are in cents)
    const amount = price.unit_amount || 0;
    const currency = price.currency;
    const interval = price.recurring?.interval || 'month';

    return NextResponse.json(
      {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          planName,
          amount: amount / 100, // Convert from cents to dollars
          currency,
          interval,
          nextBillingDate,
          customerEmail,
          customerName,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Session verification failed:', error);

    // Handle specific Stripe errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as Stripe.StripeRawError;
      
      if (stripeError.type === 'invalid_request_error' && stripeError.message?.includes('No such checkout.session')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Session not found or expired',
            details: 'This checkout session either doesn\'t exist, has expired (sessions expire after 24 hours), or belongs to a different Stripe account. Please try creating a new checkout session.',
          },
          { status: 404 }
        );
      }
    }

    // Handle Stripe-specific errors
    const errorMessage = handleStripeError(error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify session',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Handle unsupported HTTP methods
export async function POST(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use GET to verify a session.' 
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use GET to verify a session.' 
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use GET to verify a session.' 
    },
    { status: 405 }
  );
}

export async function PATCH(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use GET to verify a session.' 
    },
    { status: 405 }
  );
}
