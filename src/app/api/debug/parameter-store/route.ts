import { NextResponse } from 'next/server';
import { getParameter, getStripeSecretKey } from '@/lib/aws/secrets';

export async function GET(): Promise<NextResponse> {
  try {
    console.log('=== Parameter Store Debug ===');

    const amplifyEnv = process.env.AMPLIFY_ENV || 'staging';

    // Check environment variables with more detail
    const environmentDetails = {
      amplifyEnv,
      // Show all environment variables that start with key prefixes
      ALL_STRIPE_VARS: Object.keys(process.env).filter(key => key.startsWith('STRIPE_')),
      ALL_AMPLIFY_VARS: Object.keys(process.env).filter(key => key.startsWith('AMPLIFY_')),
      ALL_AWS_VARS: Object.keys(process.env).filter(key => key.startsWith('AWS_')),
      ALL_NEXT_VARS: Object.keys(process.env).filter(key => key.startsWith('NEXT_')),
      // Show first few characters of all env vars to debug what's actually loaded
      ENV_VAR_SAMPLE: Object.keys(process.env).slice(0, 10),
      TOTAL_ENV_VARS: Object.keys(process.env).length,
      // Parameter Store path being used
      PARAMETER_PATH: `/amplify/ezmedtech-payment-portal/${amplifyEnv}/STRIPE_SECRET_KEY`,
    };

    console.log('Environment Info:', environmentDetails);

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
        errorType: error?.constructor?.name || 'Unknown',
        // Include AWS SDK specific error details
        awsError: error && typeof error === 'object' ? {
          code: (error as { Code?: string }).Code,
          message: (error as { message?: string }).message,
          statusCode: (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode,
        } : null,
      };
    }

    // Try direct Parameter Store call with exact path
    let directParameterResult;
    try {
      const { SSMClient, GetParameterCommand } = await import('@aws-sdk/client-ssm');
      const client = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });
      const command = new GetParameterCommand({
        Name: '/amplify/ezmedtech-payment-portal/staging/STRIPE_SECRET_KEY',
        WithDecryption: true,
      });
      const response = await client.send(command);
      const value = response.Parameter?.Value;
      
      directParameterResult = {
        success: true,
        found: !!value,
        length: value?.length || 0,
        starts_with_sk: value?.startsWith('sk_') || false,
      };
    } catch (error) {
      directParameterResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name || 'Unknown',
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
      environment: environmentDetails,
      parameterTest: parameterResult,
      directParameterTest: directParameterResult,
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
