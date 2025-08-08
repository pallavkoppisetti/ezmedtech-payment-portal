'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getStripeClient } from '@/lib/stripe/config';
import type { Stripe, StripeElements } from '@stripe/stripe-js';

// TypeScript interfaces
export interface ACHSetupProps {
  customerId: string;
  onSuccess: (paymentMethodId: string, setupIntentId: string) => void;
  onCancel?: () => void;
  className?: string;
}

interface ACHVerificationStatus {
  status: 'pending' | 'verified' | 'failed' | 'requires_action';
  message: string;
  nextSteps?: string;
}

interface SetupIntentData {
  clientSecret: string;
  setupIntentId: string;
  mandateText: string;
}

const ACHSetup: React.FC<ACHSetupProps> = ({
  customerId,
  onSuccess,
  onCancel,
  className,
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [setupIntentData, setSetupIntentData] = useState<SetupIntentData | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [mandateAccepted, setMandateAccepted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<ACHVerificationStatus | null>(null);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    accountType: 'checking' as 'checking' | 'savings',
  });
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'verification' | 'complete'>('setup');

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await getStripeClient();
        setStripe(stripeInstance);
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        toast.error('Failed to initialize payment system');
      }
    };

    initializeStripe();
  }, []);

  // Create SetupIntent for ACH
  const createSetupIntent = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/ach/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          verification_method: 'microdeposits',
          metadata: {
            source: 'ach_setup_component',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (response.ok && result.client_secret) {
        setSetupIntentData({
          clientSecret: result.client_secret,
          setupIntentId: result.setup_intent_id,
          mandateText: result.mandate_text,
        });
        
        // Initialize Stripe Elements for bank account collection
        if (stripe) {
          const elementsInstance = stripe.elements({
            clientSecret: result.client_secret,
          });
          setElements(elementsInstance);
        }
        
        toast.success('Ready to set up bank account');
      } else {
        throw new Error(result.error || 'Failed to create setup intent');
      }
    } catch (error) {
      console.error('Setup intent creation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initialize ACH setup');
    } finally {
      setLoading(false);
    }
  };

  // Process ACH setup
  const processACHSetup = async () => {
    if (!stripe || !setupIntentData || !mandateAccepted) {
      toast.error('Please accept the mandate agreement');
      return;
    }

    try {
      setProcessing(true);

      // Confirm SetupIntent with bank account details
      const { error, setupIntent } = await stripe.confirmUsBankAccountSetup(
        setupIntentData.clientSecret,
        {
          payment_method: {
            us_bank_account: {
              routing_number: bankDetails.routingNumber,
              account_number: bankDetails.accountNumber,
              account_holder_type: 'individual',
              account_type: bankDetails.accountType,
            },
            billing_details: {
              name: bankDetails.accountHolderName,
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (setupIntent?.status === 'succeeded') {
        setCurrentStep('complete');
        setVerificationStatus({
          status: 'verified',
          message: 'Bank account verified successfully',
        });
        
        // Verify payment method on the backend
        await verifyPaymentMethod(setupIntent.id);
        
        toast.success('Bank account setup completed!');
        onSuccess(setupIntent.payment_method as string, setupIntent.id);
      } else if (setupIntent?.status === 'requires_action') {
        setCurrentStep('verification');
        setVerificationStatus({
          status: 'requires_action',
          message: 'Microdeposit verification required',
          nextSteps: 'Check your bank account for 2 small deposits (usually 1-2 business days) and verify the amounts.',
        });
        toast.info('Microdeposit verification initiated. Check your bank account in 1-2 business days.');
      } else {
        setVerificationStatus({
          status: 'pending',
          message: 'Bank account setup in progress',
        });
        setCurrentStep('verification');
      }
    } catch (error) {
      console.error('ACH setup failed:', error);
      setVerificationStatus({
        status: 'failed',
        message: error instanceof Error ? error.message : 'Setup failed',
      });
      toast.error(error instanceof Error ? error.message : 'Failed to set up bank account');
    } finally {
      setProcessing(false);
    }
  };

  // Verify payment method on backend
  const verifyPaymentMethod = async (setupIntentId: string) => {
    try {
      const response = await fetch(`/api/stripe/ach/verify?setup_intent_id=${setupIntentId}`);
      const result = await response.json();
      
      if (result.success && result.paymentMethod) {
        console.log('Payment method verified and stored:', result.paymentMethod);
      }
    } catch (error) {
      console.error('Backend verification failed:', error);
      // Don't throw here as the main setup was successful
    }
  };

  // Start the setup process
  useEffect(() => {
    if (stripe && !setupIntentData) {
      createSetupIntent();
    }
  }, [stripe]);

  // Handle form validation
  const isFormValid = 
    bankDetails.accountNumber.length >= 4 &&
    bankDetails.routingNumber.length === 9 &&
    bankDetails.accountHolderName.trim().length > 0 &&
    mandateAccepted;

  // Render verification status
  const renderVerificationStatus = () => {
    if (!verificationStatus) return null;

    const { status, message, nextSteps } = verificationStatus;
    
    const statusConfig = {
      pending: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
      verified: { icon: Check, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
      failed: { icon: X, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
      requires_action: { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className={cn('p-4 rounded-lg border', config.bgColor, config.borderColor)}>
        <div className="flex items-start space-x-3">
          <Icon className={cn('w-5 h-5 mt-0.5', config.color)} />
          <div className="flex-1">
            <p className={cn('font-medium', config.color)}>{message}</p>
            {nextSteps && (
              <p className="text-sm text-gray-600 mt-1">{nextSteps}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing ACH setup...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Setup Bank Transfer</CardTitle>
            <CardDescription className="mt-2">
              Add your bank account for direct debit payments and save 60% on processing fees
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center space-x-4 mt-6">
          <div className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === 'setup' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            )}>
              1
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Bank Details</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200">
            <div className={cn(
              'h-full transition-all duration-300',
              currentStep !== 'setup' ? 'bg-green-600 w-full' : 'bg-blue-600 w-0'
            )}></div>
          </div>
          <div className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === 'setup' ? 'bg-gray-200 text-gray-500' :
              currentStep === 'verification' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            )}>
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Verification</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200">
            <div className={cn(
              'h-full transition-all duration-300',
              currentStep === 'complete' ? 'bg-green-600 w-full' : 'bg-blue-600 w-0'
            )}></div>
          </div>
          <div className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
            )}>
              3
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Complete</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentStep === 'setup' && (
          <>
            {/* Bank Account Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name as it appears on your bank account"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    value={bankDetails.routingNumber}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, routingNumber: e.target.value.replace(/\D/g, '') }))}
                    maxLength={9}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9-digit routing number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Bank account number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountType"
                      value="checking"
                      checked={bankDetails.accountType === 'checking'}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' }))}
                      className="mr-2"
                    />
                    Checking
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountType"
                      value="savings"
                      checked={bankDetails.accountType === 'savings'}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' }))}
                      className="mr-2"
                    />
                    Savings
                  </label>
                </div>
              </div>
            </div>

            {/* Healthcare Mandate Agreement */}
            {setupIntentData && (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-2">Authorization Agreement</h4>
                  <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                    {setupIntentData.mandateText.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">{paragraph}</p>
                    ))}
                  </div>
                </div>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={mandateAccepted}
                    onChange={(e) => setMandateAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    I authorize EZMedTech to electronically debit my bank account for subscription payments. 
                    I understand that ACH transactions may take 3-5 business days to process.
                  </span>
                </label>
              </div>
            )}

            {/* Setup Button */}
            <Button
              onClick={processACHSetup}
              disabled={!isFormValid || processing}
              className="w-full"
              size="lg"
            >
              {processing ? 'Setting up...' : 'Setup Bank Transfer'}
            </Button>
          </>
        )}

        {(currentStep === 'verification' || currentStep === 'complete') && (
          <div className="space-y-4">
            {renderVerificationStatus()}
            
            {currentStep === 'complete' && (
              <div className="text-center py-4">
                <Badge variant="default" className="bg-green-600 text-white px-4 py-2">
                  ✓ Bank Account Successfully Added
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Your bank account is now ready for subscription payments
                </p>
              </div>
            )}
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Benefits of Bank Transfer</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Save 60% on processing fees compared to credit cards</li>
            <li>• Automatic recurring payments for your subscription</li>
            <li>• Secure and HIPAA-compliant payment processing</li>
            <li>• No expiration dates or declined payment issues</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ACHSetup;
