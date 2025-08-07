import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

// Cache for parameters to avoid repeated AWS calls
const parameterCache = new Map<string, string>();

/**
 * Get the current environment (staging/production)
 */
function getEnvironment(): string {
  // In Amplify, AMPLIFY_ENV is set automatically
  return process.env.AMPLIFY_ENV || 'staging';
}

/**
 * Fetch a parameter from AWS Parameter Store
 */
export async function getParameter(parameterName: string): Promise<string | null> {
  // Check cache first
  const cached = parameterCache.get(parameterName);
  if (cached) return cached;

  // Always try environment variable first (this should work in Amplify)
  const envValue = process.env[parameterName];
  if (envValue) {
    console.log(`[Environment] ✅ Found ${parameterName} in environment variables`);
    parameterCache.set(parameterName, envValue);
    return envValue;
  }

  console.log(`[Environment] ❌ ${parameterName} not found in environment variables`);

  try {
    // Only try Parameter Store if we have AWS credentials
    const isLocalDevelopment = !process.env.AMPLIFY_ENV && process.env.NODE_ENV === 'development';
    
    if (isLocalDevelopment) {
      console.log(`[Local Dev] No environment variable found for ${parameterName}`);
      return null;
    }

    // In Amplify environments, try Parameter Store as fallback
    console.log(`[Amplify] Trying Parameter Store for ${parameterName}`);
    const client = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });
    
    // Build the full parameter path
    const environment = getEnvironment();
    const fullParameterName = `/amplify/ezmedtech-payment-portal/${environment}/${parameterName}`;
    
    console.log(`[Parameter Store] Attempting to fetch: ${fullParameterName}`);
    console.log(`[Environment Info] AMPLIFY_ENV: ${process.env.AMPLIFY_ENV}, NODE_ENV: ${process.env.NODE_ENV}, AWS_REGION: ${process.env.AWS_REGION}`);
    
    const command = new GetParameterCommand({
      Name: fullParameterName,
      WithDecryption: true,
    });
    
    const response = await client.send(command);
    const value = response.Parameter?.Value || null;
    
    console.log(`[Parameter Store] Successfully fetched ${parameterName}: ${value ? '✓ Found' : '✗ Not found'}`);
    
    // Cache the value
    if (value) {
      parameterCache.set(parameterName, value);
    }
    
    return value;
  } catch (error) {
    console.error(`[Parameter Store Error] Failed to fetch parameter ${parameterName}:`, error);
    console.log(`[Final Result] ${parameterName} not found in either Parameter Store or environment variables`);
    return null;
  }
}

/**
 * Get Stripe secret key from Parameter Store or environment
 */
export async function getStripeSecretKey(): Promise<string> {
  console.log('[getStripeSecretKey] Starting to fetch Stripe secret key...');
  const key = await getParameter('STRIPE_SECRET_KEY');
  
  if (!key) {
    console.error('[getStripeSecretKey] ❌ STRIPE_SECRET_KEY not found in Parameter Store or environment');
    throw new Error('STRIPE_SECRET_KEY not found in Parameter Store or environment');
  }
  
  console.log('[getStripeSecretKey] ✅ Successfully retrieved Stripe secret key');
  return key;
}