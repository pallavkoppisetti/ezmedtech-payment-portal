import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    environment_check: {
      STRIPE_SECRET_KEY: {
        exists: !!process.env.STRIPE_SECRET_KEY,
        prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 12) || 'MISSING',
        length: process.env.STRIPE_SECRET_KEY?.length || 0
      },
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
        exists: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        prefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 12) || 'MISSING'
      },
      all_stripe_vars: Object.keys(process.env).filter(key => key.includes('STRIPE'))
    }
  });
}// Force rebuild for environment variables
