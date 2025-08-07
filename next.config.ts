import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Enable experimental features for better performance
  experimental: {
    // Remove optimizeCss as it requires deprecated critters package
    optimizePackageImports: ['lucide-react', '@stripe/stripe-js'],
    // Ensure AWS SDK works properly in serverless environment
    serverComponentsExternalPackages: ['@aws-sdk/client-ssm'],
  },

  // Image optimization for healthcare content
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Security headers for healthcare compliance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://*.stripe.com")'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://*.stripe.com",
              "connect-src 'self' https://*.stripe.com https://api.stripe.com",
              "frame-src https://*.stripe.com https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; ')
          }
        ]
      },
      // Cache static assets aggressively
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Don't cache API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      }
    ];
  },

  // HTTPS enforcement and redirects
  async redirects() {
    return [
      // Redirect legacy admin routes to dashboard
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: false,
      },
      // Redirect old billing routes
      {
        source: '/billing',
        destination: '/dashboard',
        permanent: false,
      },
      // Redirect old subscription routes
      {
        source: '/subscription',
        destination: '/pricing',
        permanent: false,
      }
    ];
  },

  // Environment-specific rewrites for API optimization
  async rewrites() {
    return [
      // Health check endpoint
      {
        source: '/health',
        destination: '/api/stripe/test-connection',
      },
      // API versioning support
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      }
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }

    // Bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Disable source maps in production for security
  productionBrowserSourceMaps: false,

  // Output configuration for static export if needed
  trailingSlash: false,
  
  // Environment variables validation
  env: {
    // These are made available to the client-side and server-side
    // Only non-sensitive variables should be here
    AMPLIFY_ENV: process.env.AMPLIFY_ENV,
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
