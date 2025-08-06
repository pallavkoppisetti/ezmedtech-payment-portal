import { NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe/config';

export async function GET(): Promise<NextResponse> {
  try {
    const stripe = getStripeServer();
    
    // Test Stripe connection by listing the first few products
    const products = await stripe.products.list({ limit: 3 });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Stripe connection successful',
        account: {
          connected: true,
          productCount: products.data.length,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Stripe connection test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Stripe connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
