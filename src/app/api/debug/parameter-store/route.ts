import { NextResponse } from 'next/server';
import { getParameter, getStripeSecretKey } from '@/lib/aws/secrets';

export async function GET(): Promise<NextResponse> {
  try {
    console.log('=== Parameter Store Debug ===');
    
    // Check environment variables
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      AMPLIFY_ENV: process.env.AMPLIFY_ENV,
      AWS_REGION: process.env.AWS_REGION,
      STRIPE_SECRET_KEY_EXISTS: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_SECRET_KEY_LENGTH: process.env.STRIPE_SECRET_KEY?.length || 0,
    };
    
    console.log('Environment Info:', envInfo);
    
    // Try to fetch the parameter directly
    let parameterResult;
    try {
      const key = await getParameter('STRIPE_SECRET_KEY');
      parameterResult = {
        success: true,
        found: !!key,
        length: key?.length || 0,
        starts_with_sk: key?.startsWith('sk_') || false,
      };
    } catch (error) {
      parameterResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    
    // Try the full getStripeSecretKey function
    let stripeKeyResult;
    try {
      const key = await getStripeSecretKey();
      stripeKeyResult = {
        success: true,
        found: true,
        length: key.length,
        starts_with_sk: key.startsWith('sk_'),
      };
    } catch (error) {
      stripeKeyResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envInfo,
      parameterTest: parameterResult,
      stripeKeyTest: stripeKeyResult,
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
