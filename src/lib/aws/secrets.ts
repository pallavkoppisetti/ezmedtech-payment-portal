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
    // Only fetch from Parameter Store in production environments
    if (process.env.NODE_ENV !== 'production') {
      // In development, use local env vars
      return process.env[parameterName] || null;
    }

    const client = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });
    
    // Build the full parameter path
    const environment = getEnvironment();
    const fullParameterName = `/amplify/ezmedtech-payment-portal/${environment}/${parameterName}`;
    
    const command = new GetParameterCommand({
      Name: fullParameterName,
      WithDecryption: true,
    });
    
    const response = await client.send(command);
    const value = response.Parameter?.Value || null;
    
    // Cache the value
    if (value) {
      parameterCache.set(parameterName, value);
    }
    
    return value;
  } catch (error) {
    console.error(`Failed to fetch parameter ${parameterName}:`, error);
    // Fall back to environment variable if Parameter Store fails
    return process.env[parameterName] || null;
  }
}

/**
 * Get Stripe secret key from Parameter Store or environment
 */
export async function getStripeSecretKey(): Promise<string> {
  const key = await getParameter('STRIPE_SECRET_KEY');
  
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY not found in Parameter Store or environment');
  }
  
  return key;
}