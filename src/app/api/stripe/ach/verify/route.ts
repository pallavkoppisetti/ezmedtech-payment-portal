import { getStripeServer, handleStripeError } from '@/lib/stripe/config';
import { NextRequest, NextResponse } from 'next/server';
import type { Stripe } from 'stripe';

// TypeScript interfaces for response data
interface VerifyACHResponse {
  success: boolean;
  paymentMethod?: {
    id: string;
    type: 'us_bank_account';
    verificationStatus:
      | 'verified'
      | 'verification_failed'
      | 'requires_action'
      | 'processing'
      | 'pending';
    bankAccount: {
      last4: string;
      bankName?: string;
      accountType?: 'checking' | 'savings';
      accountHolderType?: 'individual' | 'company';
      routingNumber?: string;
      fingerprint?: string;
    };
    customerId: string;
    setupIntentId: string;
    createdAt: string;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<VerifyACHResponse | ErrorResponse>> {
  try {
    // Get setup_intent_id from query parameters
    const { searchParams } = new URL(request.url);
    const setupIntentId = searchParams.get('setup_intent_id');

    if (!setupIntentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing setup_intent_id parameter',
        },
        { status: 400 }
      );
    }

    // Validate setup_intent_id format
    if (!setupIntentId.startsWith('seti_')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid setup_intent_id format',
        },
        { status: 400 }
      );
    }

    const stripe = await getStripeServer();

    // Retrieve the SetupIntent from Stripe
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId, {
      expand: ['payment_method', 'customer'],
    });

    // Verify the SetupIntent was completed
    if (setupIntent.status !== 'succeeded') {
      return NextResponse.json(
        {
          success: false,
          error: 'SetupIntent not completed',
          details: `SetupIntent status: ${setupIntent.status}`,
        },
        { status: 400 }
      );
    }

    // Get payment method details
    const paymentMethod = setupIntent.payment_method as Stripe.PaymentMethod;
    if (!paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: 'No payment method found for this SetupIntent',
        },
        { status: 400 }
      );
    }

    // Verify it's a US bank account
    if (paymentMethod.type !== 'us_bank_account') {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment method is not a US bank account',
        },
        { status: 400 }
      );
    }

    console.log('ACH Payment Method data:', {
      id: paymentMethod.id,
      type: paymentMethod.type,
      usBankAccount: paymentMethod.us_bank_account,
      customer: paymentMethod.customer,
      created: paymentMethod.created,
    });

    // Get bank account details
    const usBankAccount = paymentMethod.us_bank_account;
    if (!usBankAccount) {
      return NextResponse.json(
        {
          success: false,
          error: 'No US bank account details found',
        },
        { status: 400 }
      );
    }

    // Determine verification status
    let verificationStatus:
      | 'verified'
      | 'verification_failed'
      | 'requires_action'
      | 'processing'
      | 'pending' = 'verified';

    // Since the SetupIntent succeeded, we can assume the payment method is verified
    // In a real implementation, you might check additional Stripe properties
    if (setupIntent.status === 'succeeded') {
      verificationStatus = 'verified';
    }

    // Get customer details
    const customer = setupIntent.customer as Stripe.Customer;
    const customerId = typeof customer === 'string' ? customer : customer?.id;

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No customer associated with this SetupIntent',
        },
        { status: 400 }
      );
    }

    // Simulate storing ACH payment method details in database
    console.log('Storing ACH payment method in database:', {
      paymentMethodId: paymentMethod.id,
      customerId: customerId,
      bankAccountLast4: usBankAccount.last4,
      bankName: usBankAccount.bank_name,
      accountType: usBankAccount.account_type,
      accountHolderType: usBankAccount.account_holder_type,
      routingNumber: usBankAccount.routing_number,
      fingerprint: usBankAccount.fingerprint,
      verificationStatus: verificationStatus,
      setupIntentId: setupIntent.id,
      createdAt: new Date(paymentMethod.created * 1000).toISOString(),
      metadata: {
        purpose: 'ach_healthcare_subscription',
        source: 'stripe_setup_intent',
        verified_at: new Date().toISOString(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          type: 'us_bank_account',
          verificationStatus: verificationStatus,
          bankAccount: {
            last4: usBankAccount.last4 || '',
            bankName: usBankAccount.bank_name || undefined,
            accountType: usBankAccount.account_type || undefined,
            accountHolderType: usBankAccount.account_holder_type || undefined,
            routingNumber: usBankAccount.routing_number || undefined,
            fingerprint: usBankAccount.fingerprint || undefined,
          },
          customerId: customerId,
          setupIntentId: setupIntent.id,
          createdAt: new Date(paymentMethod.created * 1000).toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('ACH verification failed:', error);

    // Handle specific Stripe errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as Stripe.StripeRawError;

      if (
        stripeError.type === 'invalid_request_error' &&
        stripeError.message?.includes('No such setup_intent')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'SetupIntent not found or expired',
            details:
              "This SetupIntent either doesn't exist, has expired, or belongs to a different Stripe account. Please try creating a new SetupIntent.",
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
        error: 'Failed to verify ACH payment method',
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
      error: 'Method not allowed. Use GET to verify an ACH payment method.',
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use GET to verify an ACH payment method.',
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use GET to verify an ACH payment method.',
    },
    { status: 405 }
  );
}

export async function PATCH(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use GET to verify an ACH payment method.',
    },
    { status: 405 }
  );
}
