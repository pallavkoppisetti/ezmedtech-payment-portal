import { NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe/config';

export async function GET(): Promise<NextResponse> {
  try {
    const stripe = getStripeServer();
    
    // List recent checkout sessions to see what exists
    const sessions = await stripe.checkout.sessions.list({ 
      limit: 5,
      expand: ['data.subscription', 'data.customer']
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Recent checkout sessions',
        sessions: sessions.data.map(session => ({
          id: session.id,
          status: session.status,
          payment_status: session.payment_status,
          created: new Date(session.created * 1000).toISOString(),
          customer_email: session.customer_email,
          amount_total: session.amount_total,
          url: session.url
        })),
        count: sessions.data.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to list sessions:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list sessions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
