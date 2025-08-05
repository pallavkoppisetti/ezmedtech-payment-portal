'use client';

import React, { useState } from 'react';
import PricingTable from './PricingTable';
import { type PricingTier } from '@/lib/stripe/products';

const PricingExample: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const handleSelectPlan = (tier: PricingTier, billingCycle: 'monthly' | 'yearly') => {
    setSelectedTier(tier);
    console.log('Selected plan:', {
      tier: tier.name,
      price: billingCycle === 'yearly' ? tier.price.yearly : tier.price.monthly,
      billingCycle,
      stripeProductId: tier.stripeProductId,
      stripePriceId: billingCycle === 'yearly' 
        ? tier.stripePriceId?.yearly 
        : tier.stripePriceId?.monthly
    });
    
    // Here you would typically redirect to checkout or open a payment modal
    alert(`Selected ${tier.name} plan with ${billingCycle} billing!`);
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
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  !isYearly
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
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

      {/* Pricing Table */}
      <PricingTable
        onSelectPlan={handleSelectPlan}
        showYearlyPricing={isYearly}
        highlightTierId="professional" // Override the popular tier if needed
      />

      {/* Selected Plan Display */}
      {selectedTier && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-900">
              You selected the {selectedTier.name} plan!
            </h3>
            <p className="text-blue-700 mt-2">
              Integration with Stripe checkout would happen here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingExample;
