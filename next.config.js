/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure environment variables are available at runtime
  env: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    AMPLIFY_ENV: process.env.AMPLIFY_ENV,
    AWS_REGION: process.env.AWS_REGION,
  },
  
  // Additional Next.js configurations
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: ['@aws-sdk/client-ssm'],
  },
  
  // Ensure proper handling of environment variables in serverless functions
  serverRuntimeConfig: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    AMPLIFY_ENV: process.env.AMPLIFY_ENV,
    AWS_REGION: process.env.AWS_REGION,
  },
  
  publicRuntimeConfig: {
    // Only put non-sensitive vars here
    AMPLIFY_ENV: process.env.AMPLIFY_ENV,
  },
};

module.exports = nextConfig;
