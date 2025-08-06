import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe/config';

// Request body type
interface PortalRequest {
  customer_id: string;
  return_url?: string;
}

// Response types
interface PortalSuccessResponse {
  success: true;
  portal_url: string;
  customer_id: string;
}

interface PortalErrorResponse {
  success: false;
  error: string;
  details?: string;
}

type PortalResponse = PortalSuccessResponse | PortalErrorResponse;

export async function POST(request: NextRequest): Promise<NextResponse<PortalResponse>> {
  try {
    const stripe = getStripeServer();
    
    // Parse request body
    let body: PortalRequest;
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
    if (!body.customer_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: customer_id',
        },
        { status: 400 }
      );
    }

    // Validate customer_id format (Stripe customer IDs start with 'cus_')
    if (!body.customer_id.startsWith('cus_')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid customer_id format. Must start with "cus_"',
        },
        { status: 400 }
      );
    }

    // Get the origin from the request headers for return_url
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const return_url = body.return_url || `${origin}/dashboard`;

    // Verify customer exists before creating portal session
    let customer;
    try {
      customer = await stripe.customers.retrieve(body.customer_id);
      
      // Check if customer was deleted
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
          details: customerError instanceof Error ? customerError.message : 'Unknown customer error',
        },
        { status: 404 }
      );
    }

    // Create the customer portal session
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: body.customer_id,
        return_url: return_url,
      });

      console.log(`Created portal session for customer ${body.customer_id}: ${portalSession.id}`);

      return NextResponse.json(
        {
          success: true,
          portal_url: portalSession.url,
          customer_id: body.customer_id,
        },
        { status: 200 }
      );

    } catch (portalError) {
      console.error('Error creating portal session:', portalError);
      
      // Handle specific Stripe errors
      if (portalError && typeof portalError === 'object' && 'type' in portalError) {
        const stripeError = portalError as { type: string; message?: string };
        
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
                error: 'Failed to create portal session',
                details: stripeError.message || 'Unknown Stripe error',
              },
              { status: 500 }
            );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create portal session',
          details: portalError instanceof Error ? portalError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Unexpected error in portal route:', error);
    
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

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to create a portal session.',
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to create a portal session.',
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to create a portal session.',
    },
    { status: 405 }
  );
}
