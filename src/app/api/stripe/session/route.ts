import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer, handleStripeError } from '@/lib/stripe/config';
import { getPricingTierByStripePriceId } from '@/lib/stripe/products';
import type { Stripe } from 'stripe';

// TypeScript interfaces for response data
interface CustomerData {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

interface SubscriptionData {
  id: string;
  status: string;
  planName: string;
  planId: string;
  amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

interface SessionData {
  id: string;
  paymentStatus: string;
  paymentIntent?: string;
  amountTotal: number;
  currency: string;
  customer: CustomerData;
  subscription?: SubscriptionData;
  metadata: Record<string, string>;
}

interface SessionResponse {
  success: true;
  session: SessionData;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<SessionResponse | ErrorResponse>> {
  try {
    // Get session_id from query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    // Validate session_id parameter
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: session_id',
          details: 'Please provide a valid Stripe session ID',
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
          details: 'Session ID must start with "cs_"',
        },
        { status: 400 }
      );
    }

    const stripe = getStripeServer();

    // Retrieve the checkout session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer', 'payment_intent'],
    });

    // Extract customer data
    const customer = session.customer as Stripe.Customer;
    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: 'No customer found for this session',
        },
        { status: 404 }
      );
    }

    const customerData: CustomerData = {
      id: customer.id,
      email: customer.email || session.customer_email || '',
      name: customer.name || undefined,
      phone: customer.phone || undefined,
    };

    // Prepare session data
    const sessionData: SessionData = {
      id: session.id,
      paymentStatus: session.payment_status,
      paymentIntent: session.payment_intent as string | undefined,
      amountTotal: session.amount_total || 0,
      currency: session.currency || 'usd',
      customer: customerData,
      metadata: session.metadata || {},
    };

    // If this session has a subscription, extract subscription data
    if (session.subscription) {
      const subscription = session.subscription as Stripe.Subscription;
      
      // Get the first subscription item (price)
      const subscriptionItem = subscription.items.data[0];
      if (!subscriptionItem) {
        return NextResponse.json(
          {
            success: false,
            error: 'No subscription items found',
          },
          { status: 400 }
        );
      }

      const price = subscriptionItem.price;
      const priceId = price.id;

      // Get plan details from our pricing tiers
      const tier = getPricingTierByStripePriceId(priceId);
      const planName = tier ? tier.name : 'Unknown Plan';
      const planId = tier ? tier.id : 'unknown';

      // Format subscription data with proper typing
      const subscriptionTyped = subscription as Stripe.Subscription & {
        current_period_start: number;
        current_period_end: number;
        trial_end?: number;
      };

      const subscriptionData: SubscriptionData = {
        id: subscription.id,
        status: subscription.status,
        planName,
        planId,
        amount: (price.unit_amount || 0) / 100, // Convert from cents to dollars
        currency: price.currency,
        interval: price.recurring?.interval || 'month',
        intervalCount: price.recurring?.interval_count || 1,
        currentPeriodStart: new Date(subscriptionTyped.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscriptionTyped.current_period_end * 1000).toISOString(),
        nextBillingDate: new Date(subscriptionTyped.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        trialEnd: subscriptionTyped.trial_end ? new Date(subscriptionTyped.trial_end * 1000).toISOString() : undefined,
      };

      sessionData.subscription = subscriptionData;
    }

    return NextResponse.json(
      {
        success: true,
        session: sessionData,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to retrieve session:', error);

    // Handle specific Stripe errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as Stripe.StripeRawError;
      
      if (stripeError.type === 'invalid_request_error') {
        return NextResponse.json(
          {
            success: false,
            error: 'Session not found',
            details: 'The provided session ID does not exist or has expired',
          },
          { status: 404 }
        );
      }
    }

    // Handle general Stripe errors
    const errorMessage = handleStripeError(error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve session',
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
      error: 'Method not allowed. Use GET to retrieve session information.' 
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use GET to retrieve session information.' 
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use GET to retrieve session information.' 
    },
    { status: 405 }
  );
}

export async function PATCH(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use GET to retrieve session information.' 
    },
    { status: 405 }
  );
}
