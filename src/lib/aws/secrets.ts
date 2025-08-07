import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

// Cache for parameters to avoid repeated AWS calls
const parameterCache = new Map<string, string>();

/**
 * Get the current environment from Amplify's environment variable
 */
function getEnvironment(): string {
  // This is one of the few env vars Amplify reliably provides.
  // Default to 'staging' for safety.
  return process.env.AMPLIFY_ENV || 'staging';
}

/**
 * Fetches a parameter securely from AWS SSM Parameter Store.
 * This is the single source of truth for secrets.
 */
export async function getParameter(parameterName: string): Promise<string | null> {
  // 1. Check cache first to avoid redundant API calls
  const cachedValue = parameterCache.get(parameterName);
  if (cachedValue) {
    console.log(`[Cache] ✅ Found ${parameterName} in cache.`);
    return cachedValue;
  }
  console.log(`[Cache] ❌ ${parameterName} not in cache. Fetching from Parameter Store...`);

  // 2. Determine the full parameter path from the environment
  const environment = getEnvironment();
  // IMPORTANT: This path must exactly match the path in Parameter Store
  const fullParameterName = `/amplify/ezmedtech-payment-portal/${environment}/${parameterName}`;

  try {
    // 3. Initialize the SSM client.
    // In the Amplify Lambda environment, credentials will be automatically
    // provided by the IAM role.
    const client = new SSMClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    // 4. Create and send the command to fetch the parameter
    const command = new GetParameterCommand({
      Name: fullParameterName,
      WithDecryption: true, // Required for SecureString parameters
    });

    console.log(`[Parameter Store] Fetching secret: ${fullParameterName}`);
    const response = await client.send(command);
    const value = response.Parameter?.Value;

    if (value) {
      console.log(`[Parameter Store] ✅ Successfully fetched ${parameterName}.`);
      // 5. Cache the fetched value for subsequent calls
      parameterCache.set(parameterName, value);
      return value;
    } else {
      console.error(`[Parameter Store] ❌ Fetched parameter ${parameterName}, but it has no value.`);
      return null;
    }
  } catch (error) {
    console.error(`[Parameter Store] ❌ Failed to fetch parameter: ${fullParameterName}`, error);
    // This error often indicates an IAM permission issue or an incorrect parameter path.
    // Check the IAM role attached to the Amplify App and the parameter path in AWS Console.
    return null;
  }
}

/**
 * A specific function to get the Stripe secret key.
 * This is the primary function that should be used by the application.
 */
export async function getStripeSecretKey(): Promise<string> {
  console.log('[Stripe] Attempting to retrieve Stripe Secret Key...');
  const key = await getParameter('STRIPE_SECRET_KEY');

  if (!key) {
    console.error('[Stripe] ❌ CRITICAL: STRIPE_SECRET_KEY could not be retrieved from Parameter Store.');
    throw new Error('STRIPE_SECRET_KEY not found. Check Parameter Store and IAM permissions.');
  }

  console.log('[Stripe] ✅ Successfully retrieved Stripe Secret Key.');
  return key;
}