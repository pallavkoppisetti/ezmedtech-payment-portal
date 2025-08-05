'use client';

import React, { useState } from 'react';
import PricingTable from './PricingTable';
import { type PricingTier } from '@/lib/stripe/products';
import { handleCheckoutWithToast } from '@/lib/stripe/checkout';

const PricingWithCheckout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (tier: PricingTier, billingCycle: 'monthly' | 'yearly') => {
    setError(null);

    try {
      await handleCheckoutWithToast(tier, billingCycle, {
        // Optional: Add customer email if available
        // customerEmail: 'user@example.com',
        
        // Optional: Add metadata for tracking
        metadata: {
          source: 'pricing_page',
          utm_source: 'website',
        },
        
        onLoading: setIsLoading,
        onError: setError,
      });
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Billing Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setIsYearly(false)}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                  !isYearly
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                  isYearly
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 rounded">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Checkout Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => setError(null)}
                    className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Redirecting to checkout...
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Please wait while we prepare your subscription.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Table */}
      <PricingTable
        onSelectPlan={handleSelectPlan}
        showYearlyPricing={isYearly}
        highlightTierId="professional"
      />

      {/* Integration Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🚀 Stripe Integration Ready
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">✅ Features Implemented:</h4>
              <ul className="space-y-1">
                <li>• Subscription checkout sessions</li>
                <li>• Success/cancel URL redirects</li>
                <li>• Customer creation</li>
                <li>• Metadata tracking</li>
                <li>• Error handling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 Next Steps:</h4>
              <ul className="space-y-1">
                <li>• Replace placeholder price IDs</li>
                <li>• Set up webhook handling</li>
                <li>• Create dashboard pages</li>
                <li>• Add user authentication</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingWithCheckout;
