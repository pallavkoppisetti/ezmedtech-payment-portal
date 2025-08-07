/**
 * Utility functions for environment variable management
 */

export interface EnvironmentInfo {
  isProduction: boolean;
  isStaging: boolean;
  isDevelopment: boolean;
  amplifyEnv: string | undefined;
  awsRegion: string;
  hasStripeSecretKey: boolean;
  hasStripePublishableKey: boolean;
}

/**
 * Get comprehensive environment information
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  return {
    isProduction: process.env.NODE_ENV === 'production' && process.env.AMPLIFY_ENV === 'main',
    isStaging: process.env.NODE_ENV === 'production' && process.env.AMPLIFY_ENV === 'staging',
    isDevelopment: process.env.NODE_ENV === 'development',
    amplifyEnv: process.env.AMPLIFY_ENV,
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasStripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };
}

/**
 * Validate that all required environment variables are present
 */
export function validateRequiredEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const required = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
  ];

  const missing: string[] = [];

  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Log environment information for debugging
 */
export function logEnvironmentInfo(): void {
  const info = getEnvironmentInfo();
  const validation = validateRequiredEnvironmentVariables();

  console.log('🌍 Environment Information:');
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`  - AMPLIFY_ENV: ${info.amplifyEnv || 'undefined'}`);
  console.log(`  - AWS_REGION: ${info.awsRegion}`);
  console.log(`  - Is Production: ${info.isProduction}`);
  console.log(`  - Is Staging: ${info.isStaging}`);
  console.log(`  - Is Development: ${info.isDevelopment}`);
  console.log(`  - Has Stripe Secret Key: ${info.hasStripeSecretKey ? '✅' : '❌'}`);
  console.log(`  - Has Stripe Publishable Key: ${info.hasStripePublishableKey ? '✅' : '❌'}`);
  
  if (!validation.valid) {
    console.error('❌ Missing required environment variables:');
    validation.missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
  } else {
    console.log('✅ All required environment variables are present');
  }
}
