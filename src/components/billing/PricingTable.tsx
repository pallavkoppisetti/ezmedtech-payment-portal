'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PRICING_TIERS, type PricingTier } from '@/lib/stripe/products';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import React from 'react';

// TypeScript props interface
export interface PricingTableProps {
  onSelectPlan: (
    tier: PricingTier,
    billingCycle: 'monthly' | 'yearly',
    paymentMethodType?: 'card' | 'ach'
  ) => void;
  className?: string;
  showYearlyPricing?: boolean;
  highlightTierId?: string;
  showACHSavings?: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
  onSelectPlan: (
    tier: PricingTier,
    billingCycle: 'monthly' | 'yearly',
    paymentMethodType?: 'card' | 'ach'
  ) => void;
  isPopular?: boolean;
  showYearlyPricing?: boolean;
  showACHSavings?: boolean;
  className?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  onSelectPlan,
  isPopular = false,
  showYearlyPricing = false,
  showACHSavings = false,
  className,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<'card' | 'ach'>('card');

  const currentPrice =
    showYearlyPricing && tier.price.yearly ? tier.price.yearly : tier.price.monthly;
  const billingCycle = showYearlyPricing && tier.price.yearly ? 'yearly' : 'monthly';
  const originalPrice = showYearlyPricing && tier.price.yearly ? tier.price.monthly : null;

  // Calculate yearly discount percentage
  const yearlyDiscount = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Calculate ACH savings (60% off processing fees, not the subscription price)
  const achSavings = showACHSavings && selectedPaymentMethod === 'ach';

  return (
    <Card
      className={cn(
        'relative flex flex-col h-full transition-all duration-200 hover:shadow-lg',
        isPopular && 'border-blue-500 border-2 shadow-lg scale-105',
        className
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="bg-blue-600 text-white px-3 py-1">
            Most Popular
          </Badge>
        </div>
      )}

      {achSavings && (
        <div className="absolute -top-3 right-4">
          <Badge variant="default" className="bg-green-600 text-white px-3 py-1">
            Save 60% with bank transfer
          </Badge>
        </div>
      )}

      <CardHeader className={cn('text-center', isPopular && 'pt-8')}>
        <CardTitle className="text-xl font-bold text-gray-900">{tier.name}</CardTitle>
        <CardDescription className="text-gray-500 mt-2">{tier.description}</CardDescription>

        <div className="mt-4">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-900">${currentPrice}</span>
            <span className="text-gray-500 ml-2">/{showYearlyPricing ? 'month' : 'month'}</span>
          </div>

          {showYearlyPricing && originalPrice && (
            <div className="mt-2">
              <span className="text-sm text-gray-500 line-through">${originalPrice}/month</span>
              <span className="text-sm text-green-600 ml-2 font-medium">
                Save {yearlyDiscount}%
              </span>
            </div>
          )}

          {showYearlyPricing && tier.price.yearly && (
            <p className="text-sm text-gray-500 mt-1">
              Billed annually (${tier.price.yearly * 12}/year)
            </p>
          )}
        </div>

        {/* ACH Payment Method Toggle */}
        {showACHSavings && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-600 font-medium">Payment Method</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPaymentMethod('card')}
                className={cn(
                  'flex-1 px-3 py-2 text-sm rounded-md border transition-all duration-200',
                  selectedPaymentMethod === 'card'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                )}
              >
                💳 Card
              </button>
              <button
                onClick={() => setSelectedPaymentMethod('ach')}
                className={cn(
                  'flex-1 px-3 py-2 text-sm rounded-md border transition-all duration-200',
                  selectedPaymentMethod === 'ach'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                )}
              >
                🏦 Bank Transfer
              </button>
            </div>
            {selectedPaymentMethod === 'ach' && (
              <p className="text-xs text-green-600">
                Save 60% on processing fees with direct bank transfer
              </p>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5',
                  feature.included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                )}
              >
                <Check className="w-3 h-3" />
              </div>
              <div>
                <span
                  className={cn('text-sm', feature.included ? 'text-gray-900' : 'text-gray-400')}
                >
                  {feature.name}
                </span>
                {feature.description && (
                  <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          onClick={() =>
            onSelectPlan(tier, billingCycle, showACHSavings ? selectedPaymentMethod : undefined)
          }
          className={cn(
            'w-full transition-all duration-200',
            isPopular
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-900 hover:bg-gray-800 text-white',
            showACHSavings && selectedPaymentMethod === 'ach' && 'bg-green-600 hover:bg-green-700'
          )}
          size="lg"
        >
          {showACHSavings && selectedPaymentMethod === 'ach'
            ? 'Get Started with Bank Transfer'
            : 'Get Started'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const PricingTable: React.FC<PricingTableProps> = ({
  onSelectPlan,
  className,
  showYearlyPricing = false,
  highlightTierId,
  showACHSavings = false,
}) => {
  return (
    <div className={cn('w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Choose Your Plan</h2>
        <p className="mt-4 text-lg text-gray-600">
          Select the perfect plan for your healthcare practice
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {showYearlyPricing && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              💰 Save up to 20% with yearly billing
            </Badge>
          )}

          {showACHSavings && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              🏦 Save 60% on processing fees with bank transfer
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
        {PRICING_TIERS.map((tier) => {
          const isPopular = tier.popular || tier.id === highlightTierId;

          return (
            <PricingCard
              key={tier.id}
              tier={tier}
              onSelectPlan={onSelectPlan}
              isPopular={isPopular}
              showYearlyPricing={showYearlyPricing}
              showACHSavings={showACHSavings}
              className={cn('transform transition-all duration-200', isPopular && 'lg:scale-105')}
            />
          );
        })}
      </div>

      {/* Footer Section */}
      <div className="mt-12 text-center">
        <p className="text-gray-600">
          All plans include HIPAA-compliant data storage and 30-day free trial
        </p>
        <p className="text-sm text-gray-500 mt-2">
          No setup fees • Cancel anytime • 24/7 customer support
          {showACHSavings && ' • Instant bank transfer setup'}
        </p>
      </div>
    </div>
  );
};

export default PricingTable;
