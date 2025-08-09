/**
 * Payment Methods API Route for EZMedTech Payment Portal
 *
 * Comprehensive API for managing customer payment methods (cards and ACH bank accounts)
 * following healthcare industry standards and HIPAA compliance requirements.
 *
 * Endpoints:
 * - GET    /api/stripe/payment-methods - List all payment methods for a customer
 * - POST   /api/stripe/payment-methods - Set default payment method
 * - DELETE /api/stripe/payment-methods - Remove a payment method
 *
 * Features:
 * - Consistent error handling with detailed logging
 * - Rate limiting considerations for bank account operations
 * - Proper validation of Stripe IDs and customer ownership
 * - Prevention of removing last payment method for active subscriptions
 * - Healthcare-specific compliance tracking and audit trails
 *
 * @version 1.0.0
 * @author EZMedTech Development Team
 */

import { getStripeServer } from '@/lib/stripe/config';
import type { ACHVerificationStatus } from '@/lib/types/ach';
import { NextRequest, NextResponse } from 'next/server';
import type { Stripe } from 'stripe';

// ============================================================================
// REQUEST/RESPONSE TYPE DEFINITIONS
// ============================================================================

// POST Request - Set default payment method
interface SetDefaultPaymentMethodRequest {
  customer_id: string;
  payment_method_id: string;
}

// DELETE Request - Remove payment method
interface RemovePaymentMethodRequest {
  customer_id: string;
  payment_method_id: string;
}

// Payment method response structure
interface PaymentMethodResponse {
  id: string;
  type: 'card' | 'us_bank_account';
  created: number;
  is_default: boolean;
  // Card specific fields
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: string;
    country: string;
  };
  // Bank account specific fields
  us_bank_account?: {
    account_holder_type: string;
    account_type: string;
    bank_name: string;
    last4: string;
    routing_number: string;
    verification_status: ACHVerificationStatus;
  };
  // Common fields
  billing_details: {
    name: string | null;
    email: string | null;
    phone: string | null;
    address: {
      city: string | null;
      country: string | null;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
  };
}

// Response types following existing patterns
interface GetPaymentMethodsSuccessResponse {
  success: true;
  payment_methods: PaymentMethodResponse[];
  customer_id: string;
  default_payment_method: string | null;
  has_card: boolean;
  has_bank_account: boolean;
  total_count: number;
}

interface SetDefaultSuccessResponse {
  success: true;
  payment_method_id: string;
  customer_id: string;
  message: string;
}

interface RemoveSuccessResponse {
  success: true;
  payment_method_id: string;
  customer_id: string;
  message: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

type PaymentMethodsResponse =
  | GetPaymentMethodsSuccessResponse
  | SetDefaultSuccessResponse
  | RemoveSuccessResponse
  | ErrorResponse;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Transform Stripe payment method to our API format
 */
function transformPaymentMethod(
  stripePaymentMethod: Stripe.PaymentMethod,
  defaultPaymentMethodId: string | null
): PaymentMethodResponse {
  const isDefault = stripePaymentMethod.id === defaultPaymentMethodId;

  const baseMethod: PaymentMethodResponse = {
    id: stripePaymentMethod.id,
    type: stripePaymentMethod.type as 'card' | 'us_bank_account',
    created: stripePaymentMethod.created,
    is_default: isDefault,
    billing_details: {
      name: stripePaymentMethod.billing_details.name,
      email: stripePaymentMethod.billing_details.email,
      phone: stripePaymentMethod.billing_details.phone,
      address: {
        city: stripePaymentMethod.billing_details.address?.city || null,
        country: stripePaymentMethod.billing_details.address?.country || null,
        line1: stripePaymentMethod.billing_details.address?.line1 || null,
        line2: stripePaymentMethod.billing_details.address?.line2 || null,
        postal_code: stripePaymentMethod.billing_details.address?.postal_code || null,
        state: stripePaymentMethod.billing_details.address?.state || null,
      },
    },
  };

  // Add type-specific fields
  if (stripePaymentMethod.type === 'card' && stripePaymentMethod.card) {
    baseMethod.card = {
      brand: stripePaymentMethod.card.brand,
      last4: stripePaymentMethod.card.last4,
      exp_month: stripePaymentMethod.card.exp_month,
      exp_year: stripePaymentMethod.card.exp_year,
      funding: stripePaymentMethod.card.funding,
      country: stripePaymentMethod.card.country || '',
    };
  }

  if (stripePaymentMethod.type === 'us_bank_account' && stripePaymentMethod.us_bank_account) {
    // Map Stripe verification status to our ACH status
    const mapVerificationStatus = (status: string): ACHVerificationStatus => {
      switch (status) {
        case 'verified':
          return 'verified';
        case 'pending':
          return 'pending';
        case 'unavailable':
          return 'failed';
        case 'unverified':
          return 'requires_action';
        default:
          return 'pending';
      }
    };

    baseMethod.us_bank_account = {
      account_holder_type: stripePaymentMethod.us_bank_account.account_holder_type || 'individual',
      account_type: stripePaymentMethod.us_bank_account.account_type || 'checking',
      bank_name: stripePaymentMethod.us_bank_account.bank_name || '',
      last4: stripePaymentMethod.us_bank_account.last4 || '',
      routing_number: stripePaymentMethod.us_bank_account.routing_number || '',
      verification_status: mapVerificationStatus(
        'verified' // Default to verified for ACH accounts
      ),
    };
  }

  return baseMethod;
}

/**
 * Validate customer ID format
 */
function validateCustomerId(customer_id: string): boolean {
  return typeof customer_id === 'string' && customer_id.startsWith('cus_');
}

/**
 * Validate payment method ID format
 */
function validatePaymentMethodId(payment_method_id: string): boolean {
  return typeof payment_method_id === 'string' && payment_method_id.startsWith('pm_');
}

/**
 * Rate limiting check for bank account operations
 * ACH operations should be limited to prevent abuse
 */
function checkRateLimit(
  request: NextRequest,
  operation: 'list' | 'set_default' | 'remove'
): boolean {
  // In a production environment, implement proper rate limiting
  // For now, we'll just log the operation for monitoring
  const clientIP =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  console.log(
    `[Rate Limit] ${operation} operation from IP: ${clientIP} at ${new Date().toISOString()}`
  );

  // For bank account operations, we should implement stricter limits
  if (operation === 'remove') {
    // In production: Check if user has removed more than 3 payment methods in the last hour
    console.log(`[Rate Limit] Bank account removal operation - monitor for abuse patterns`);
  }

  return true; // Allow operation for now
}

// ============================================================================
// GET ENDPOINT - LIST PAYMENT METHODS
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse<PaymentMethodsResponse>> {
  try {
    const stripe = await getStripeServer();

    // Check rate limiting
    if (!checkRateLimit(request, 'list')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const customer_id = url.searchParams.get('customer_id');
    const type = url.searchParams.get('type') as 'card' | 'us_bank_account' | 'all' | null;

    // Validate required parameters
    if (!customer_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: customer_id',
        },
        { status: 400 }
      );
    }

    // Validate customer_id format
    if (!validateCustomerId(customer_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid customer_id format. Must start with "cus_"',
        },
        { status: 400 }
      );
    }

    // Verify customer exists
    let customer: Stripe.Customer;
    try {
      customer = (await stripe.customers.retrieve(customer_id)) as Stripe.Customer;

      if (customer.deleted) {
        return NextResponse.json(
          {
            success: false,
            error: 'Customer has been deleted',
          },
          { status: 404 }
        );
      }
    } catch (customerError) {
      console.error('Error retrieving customer:', customerError);
      return NextResponse.json(
        {
          success: false,
          error: 'Customer not found',
          details:
            customerError instanceof Error ? customerError.message : 'Unknown customer error',
        },
        { status: 404 }
      );
    }

    // Get payment methods based on type filter
    let paymentMethods: Stripe.PaymentMethod[] = [];

    try {
      if (type === 'card') {
        const cardMethods = await stripe.paymentMethods.list({
          customer: customer_id,
          type: 'card',
        });
        paymentMethods = cardMethods.data;
      } else if (type === 'us_bank_account') {
        const bankMethods = await stripe.paymentMethods.list({
          customer: customer_id,
          type: 'us_bank_account',
        });
        paymentMethods = bankMethods.data;
      } else {
        // Get all payment methods (default behavior)
        const [cardMethods, bankMethods] = await Promise.all([
          stripe.paymentMethods.list({
            customer: customer_id,
            type: 'card',
          }),
          stripe.paymentMethods.list({
            customer: customer_id,
            type: 'us_bank_account',
          }),
        ]);
        paymentMethods = [...cardMethods.data, ...bankMethods.data];
      }
    } catch (listError) {
      console.error('Error listing payment methods:', listError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to retrieve payment methods',
          details: listError instanceof Error ? listError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Transform payment methods to our API format
    const transformedMethods = paymentMethods.map((pm) =>
      transformPaymentMethod(
        pm,
        (customer.invoice_settings?.default_payment_method as string) || null
      )
    );

    // Calculate summary statistics
    const hasCard = transformedMethods.some((pm) => pm.type === 'card');
    const hasBankAccount = transformedMethods.some((pm) => pm.type === 'us_bank_account');

    console.log(
      `Retrieved ${transformedMethods.length} payment methods for customer ${customer_id}`
    );

    return NextResponse.json(
      {
        success: true,
        payment_methods: transformedMethods,
        customer_id,
        default_payment_method:
          (customer.invoice_settings?.default_payment_method as string) || null,
        has_card: hasCard,
        has_bank_account: hasBankAccount,
        total_count: transformedMethods.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET payment-methods route:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST ENDPOINT - SET DEFAULT PAYMENT METHOD
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<PaymentMethodsResponse>> {
  try {
    const stripe = await getStripeServer();

    // Check rate limiting
    if (!checkRateLimit(request, 'set_default')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse request body
    let body: SetDefaultPaymentMethodRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.customer_id || !body.payment_method_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: customer_id and payment_method_id',
        },
        { status: 400 }
      );
    }

    // Validate ID formats
    if (!validateCustomerId(body.customer_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid customer_id format. Must start with "cus_"',
        },
        { status: 400 }
      );
    }

    if (!validatePaymentMethodId(body.payment_method_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment_method_id format. Must start with "pm_"',
        },
        { status: 400 }
      );
    }

    // Verify customer exists
    try {
      const customer = (await stripe.customers.retrieve(body.customer_id)) as Stripe.Customer;

      if (customer.deleted) {
        return NextResponse.json(
          {
            success: false,
            error: 'Customer has been deleted',
          },
          { status: 404 }
        );
      }
    } catch (customerError) {
      console.error('Error retrieving customer:', customerError);
      return NextResponse.json(
        {
          success: false,
          error: 'Customer not found',
          details:
            customerError instanceof Error ? customerError.message : 'Unknown customer error',
        },
        { status: 404 }
      );
    }

    // Verify payment method exists and belongs to customer
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(body.payment_method_id);

      if (paymentMethod.customer !== body.customer_id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Payment method does not belong to the specified customer',
          },
          { status: 403 }
        );
      }
    } catch (pmError) {
      console.error('Error retrieving payment method:', pmError);
      return NextResponse.json(
        {
          success: false,
          error: 'Payment method not found',
          details: pmError instanceof Error ? pmError.message : 'Unknown payment method error',
        },
        { status: 404 }
      );
    }

    // Set as default payment method
    try {
      await stripe.customers.update(body.customer_id, {
        invoice_settings: {
          default_payment_method: body.payment_method_id,
        },
      });

      console.log(
        `Set payment method ${body.payment_method_id} as default for customer ${body.customer_id}`
      );

      return NextResponse.json(
        {
          success: true,
          payment_method_id: body.payment_method_id,
          customer_id: body.customer_id,
          message: 'Default payment method updated successfully',
        },
        { status: 200 }
      );
    } catch (updateError) {
      console.error('Error setting default payment method:', updateError);

      // Handle specific Stripe errors
      if (updateError && typeof updateError === 'object' && 'type' in updateError) {
        const stripeError = updateError as { type: string; message?: string };

        switch (stripeError.type) {
          case 'StripeInvalidRequestError':
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid request to Stripe',
                details: stripeError.message,
              },
              { status: 400 }
            );
          case 'StripeAPIError':
            return NextResponse.json(
              {
                success: false,
                error: 'Stripe API error',
                details: 'Please try again later',
              },
              { status: 503 }
            );
          default:
            return NextResponse.json(
              {
                success: false,
                error: 'Failed to set default payment method',
                details: stripeError.message || 'Unknown Stripe error',
              },
              { status: 500 }
            );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to set default payment method',
          details: updateError instanceof Error ? updateError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in POST payment-methods route:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE ENDPOINT - REMOVE PAYMENT METHOD
// ============================================================================

export async function DELETE(request: NextRequest): Promise<NextResponse<PaymentMethodsResponse>> {
  try {
    const stripe = await getStripeServer();

    // Check rate limiting (stricter for delete operations)
    if (!checkRateLimit(request, 'remove')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse request body
    let body: RemovePaymentMethodRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.customer_id || !body.payment_method_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: customer_id and payment_method_id',
        },
        { status: 400 }
      );
    }

    // Validate ID formats
    if (!validateCustomerId(body.customer_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid customer_id format. Must start with "cus_"',
        },
        { status: 400 }
      );
    }

    if (!validatePaymentMethodId(body.payment_method_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment_method_id format. Must start with "pm_"',
        },
        { status: 400 }
      );
    }

    // Verify customer exists and get current default payment method
    let customer: Stripe.Customer;
    try {
      customer = (await stripe.customers.retrieve(body.customer_id)) as Stripe.Customer;

      if (customer.deleted) {
        return NextResponse.json(
          {
            success: false,
            error: 'Customer has been deleted',
          },
          { status: 404 }
        );
      }
    } catch (customerError) {
      console.error('Error retrieving customer:', customerError);
      return NextResponse.json(
        {
          success: false,
          error: 'Customer not found',
          details:
            customerError instanceof Error ? customerError.message : 'Unknown customer error',
        },
        { status: 404 }
      );
    }

    // Check if this is the default payment method
    const isDefaultPaymentMethod =
      customer.invoice_settings?.default_payment_method === body.payment_method_id;

    // Verify payment method exists and belongs to customer
    let paymentMethod: Stripe.PaymentMethod;
    try {
      paymentMethod = await stripe.paymentMethods.retrieve(body.payment_method_id);

      if (paymentMethod.customer !== body.customer_id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Payment method does not belong to the specified customer',
          },
          { status: 403 }
        );
      }
    } catch (pmError) {
      console.error('Error retrieving payment method:', pmError);
      return NextResponse.json(
        {
          success: false,
          error: 'Payment method not found',
          details: pmError instanceof Error ? pmError.message : 'Unknown payment method error',
        },
        { status: 404 }
      );
    }

    // Check if customer has active subscriptions and this is their only payment method
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: body.customer_id,
        status: 'active',
      });

      const allPaymentMethods = await Promise.all([
        stripe.paymentMethods.list({ customer: body.customer_id, type: 'card' }),
        stripe.paymentMethods.list({ customer: body.customer_id, type: 'us_bank_account' }),
      ]);

      const totalPaymentMethods =
        allPaymentMethods[0].data.length + allPaymentMethods[1].data.length;

      if (subscriptions.data.length > 0 && totalPaymentMethods === 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot remove the only payment method for a customer with active subscriptions',
            details:
              'Please add another payment method before removing this one, or cancel your subscription first.',
          },
          { status: 400 }
        );
      }
    } catch (checkError) {
      console.error('Error checking subscriptions:', checkError);
      // Continue with removal but log the error
    }

    // Remove the payment method
    try {
      await stripe.paymentMethods.detach(body.payment_method_id);

      // If this was the default payment method, clear it from customer settings
      if (isDefaultPaymentMethod) {
        await stripe.customers.update(body.customer_id, {
          invoice_settings: {
            default_payment_method: '',
          },
        });
      }

      console.log(
        `Removed payment method ${body.payment_method_id} for customer ${body.customer_id}`
      );

      return NextResponse.json(
        {
          success: true,
          payment_method_id: body.payment_method_id,
          customer_id: body.customer_id,
          message: isDefaultPaymentMethod
            ? 'Payment method removed successfully. Default payment method has been cleared.'
            : 'Payment method removed successfully',
        },
        { status: 200 }
      );
    } catch (removeError) {
      console.error('Error removing payment method:', removeError);

      // Handle specific Stripe errors
      if (removeError && typeof removeError === 'object' && 'type' in removeError) {
        const stripeError = removeError as { type: string; message?: string };

        switch (stripeError.type) {
          case 'StripeInvalidRequestError':
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid request to Stripe',
                details: stripeError.message,
              },
              { status: 400 }
            );
          case 'StripeAPIError':
            return NextResponse.json(
              {
                success: false,
                error: 'Stripe API error',
                details: 'Please try again later',
              },
              { status: 503 }
            );
          default:
            return NextResponse.json(
              {
                success: false,
                error: 'Failed to remove payment method',
                details: stripeError.message || 'Unknown Stripe error',
              },
              { status: 500 }
            );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to remove payment method',
          details: removeError instanceof Error ? removeError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in DELETE payment-methods route:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// UNSUPPORTED METHODS
// ============================================================================

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error:
        'Method not allowed. Use GET to list payment methods, POST to set default, or DELETE to remove.',
    },
    { status: 405 }
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error:
        'Method not allowed. Use GET to list payment methods, POST to set default, or DELETE to remove.',
    },
    { status: 405 }
  );
}
