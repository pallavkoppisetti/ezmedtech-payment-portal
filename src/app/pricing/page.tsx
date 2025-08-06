'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import PricingTable from '@/components/billing/PricingTable';
import { type PricingTier } from '@/lib/stripe/products';
import { redirectToCheckout } from '@/lib/stripe/checkout';

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const handleSelectPlan = async (tier: PricingTier, billingCycle: 'monthly' | 'yearly') => {
    const planKey = `${tier.id}-${billingCycle}`;
    
    try {
      setIsLoading(true);
      setLoadingPlan(planKey);

      // Show loading toast
      toast.loading(`Redirecting to checkout for ${tier.name} plan...`, {
        id: 'checkout-loading',
      });

      await redirectToCheckout(tier, billingCycle, {
        metadata: {
          source: 'pricing_page',
          tierName: tier.name,
          tierId: tier.id,
          billingCycle,
          timestamp: new Date().toISOString(),
        },
      });

      // This won't execute if redirect is successful, but just in case
      toast.dismiss('checkout-loading');
      
    } catch (error) {
      console.error('Checkout failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to start checkout. Please try again.';
      
      // Dismiss loading toast and show error
      toast.dismiss('checkout-loading');
      toast.error('Checkout Error', {
        description: errorMessage,
        duration: 5000,
        action: {
          label: 'Try Again',
          onClick: () => handleSelectPlan(tier, billingCycle),
        },
      });
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            {/* EZMedTech Branding */}
            <div className="flex justify-center items-center mb-8">
              <div className="bg-blue-600 rounded-lg p-3 mr-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                EZMed<span className="text-blue-600">Tech</span>
              </h1>
            </div>
            
            {/* Main Heading */}
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Choose Your 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                {" "}Perfect Plan
              </span>
            </h2>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline your healthcare practice with our comprehensive patient management platform. 
              HIPAA-compliant, secure, and designed for modern healthcare professionals.
            </p>
            
            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">HIPAA Compliant</span>
              </div>
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">30-Day Free Trial</span>
              </div>
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">24/7 Support</span>
              </div>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-16">
              <div className="bg-white rounded-lg p-1 shadow-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setIsYearly(false)}
                    disabled={isLoading}
                    className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 disabled:opacity-50 ${
                      !isYearly
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setIsYearly(true)}
                    disabled={isLoading}
                    className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 disabled:opacity-50 relative ${
                      isYearly
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Yearly Billing
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Table Section */}
      <div className="relative -mt-12">
        <PricingTable
          onSelectPlan={handleSelectPlan}
          showYearlyPricing={isYearly}
          highlightTierId="professional"
          className="relative z-10"
        />
      </div>

      {/* Trust Section */}
      <div className="bg-white py-16 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of healthcare providers who trust EZMedTech for their patient management needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">HIPAA Compliant</h4>
              <p className="text-gray-600">
                Industry-standard security measures to protect patient data and ensure compliance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h4>
              <p className="text-gray-600">
                Cloud-based platform with 99.9% uptime and instant data synchronization.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.944a11.955 11.955 0 11-8.618 3.04A12.02 12.02 0 0112 2.944z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Expert Support</h4>
              <p className="text-gray-600">
                Dedicated support team with healthcare industry expertise available 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-gray-600">
              Everything you need to know about our pricing and plans.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan at any time?
              </h4>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and billing is prorated automatically.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a setup fee?
              </h4>
              <p className="text-gray-600">
                No setup fees, ever. We believe in transparent pricing with no hidden costs. 
                Your subscription includes everything you need to get started.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my data if I cancel?
              </h4>
              <p className="text-gray-600">
                Your data remains accessible for 30 days after cancellation. We also provide 
                easy data export tools to ensure you never lose your important patient information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Practice?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of healthcare professionals who have streamlined their workflow with EZMedTech.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const element = document.querySelector('[data-tier="professional"]');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              View Plans
            </button>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Preparing Your Checkout
            </h3>
            <p className="text-gray-600 text-sm">
              {loadingPlan ? `Setting up ${loadingPlan.split('-')[0]} plan...` : 'Please wait...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
