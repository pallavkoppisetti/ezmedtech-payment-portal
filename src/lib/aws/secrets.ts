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

  try {
    // Use Parameter Store in Amplify environments (staging/production)
    // Only use local env vars in true local development
    const isLocalDevelopment = !process.env.AMPLIFY_ENV && process.env.NODE_ENV === 'development';
    
    if (isLocalDevelopment) {
      // In local development, use local env vars
      console.log(`[Local Dev] Fetching ${parameterName} from environment variable`);
      return process.env[parameterName] || null;
    }

    // In Amplify environments (staging/production), use Parameter Store
    console.log(`[Amplify] Fetching ${parameterName} from Parameter Store`);
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
    console.log(`[Fallback] Trying environment variable: ${parameterName}`);
    
    // Fall back to environment variable if Parameter Store fails
    const envValue = process.env[parameterName];
    if (envValue) {
      console.log(`[Fallback] ✅ Found ${parameterName} in environment variables`);
    } else {
      console.log(`[Fallback] ❌ ${parameterName} not found in environment variables either`);
    }
    
    return envValue || null;
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