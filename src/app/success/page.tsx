'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Home,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// TypeScript interfaces
interface SubscriptionData {
  id: string;
  status: string;
  planName: string;
  amount: number;
  currency: string;
  interval: string;
  nextBillingDate: string;
  customerEmail: string;
  customerName?: string;
}

interface VerifySessionResponse {
  success: boolean;
  subscription?: SubscriptionData;
  paymentMethod?: {
    id: string;
    type: string;
    object: string;
  } | null;
  error?: string;
  details?: string;
}

// Component that uses search params
function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<{
    id: string;
    type: string;
    object: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('No session ID found in URL');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        const data: VerifySessionResponse = await response.json();

        if (data.success && data.subscription) {
          setSubscription(data.subscription);
          setPaymentMethod(data.paymentMethod || null);
        } else {
          // Handle specific error cases
          if (response.status === 404) {
            setError(
              'This checkout session has expired or is no longer valid. Sessions expire after 24 hours. Please create a new checkout session.'
            );
          } else {
            setError(data.error || 'Failed to verify session');
          }
        }
      } catch (err) {
        console.error('Error verifying session:', err);
        setError('Failed to verify your subscription. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trialing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isACHPayment = () => {
    return paymentMethod?.type === 'us_bank_account';
  };

  const getACHSettlementDate = () => {
    // ACH payments typically settle 3-5 business days after processing
    const today = new Date();
    const settlementDate = new Date(today);
    settlementDate.setDate(today.getDate() + 5); // Conservative 5 business days
    return settlementDate;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-4">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Verifying Your Subscription...
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your payment and set up your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  Back to Pricing
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg">Contact Support</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to EZMedTech!
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {isACHPayment()
              ? 'Thank you for subscribing! Your ACH payment is being processed and your account setup is underway.'
              : 'Thank you for subscribing! Your payment was successful and your account is ready.'}
          </p>

          {/* ACH-specific notice */}
          {isACHPayment() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto mb-6">
              <div className="flex items-start space-x-3">
                <Clock className="w-6 h-6 text-blue-600 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-blue-900 mb-2">ACH Payment Processing</h3>
                  <p className="text-blue-800 text-sm mb-2">
                    Your bank account payment is being processed. ACH payments typically take 3-5
                    business days to complete.
                  </p>
                  <p className="text-blue-800 text-sm">
                    <strong>Expected Settlement:</strong>{' '}
                    {formatDate(getACHSettlementDate().toISOString())}
                  </p>
                </div>
              </div>
            </div>
          )}

          {subscription && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm font-medium text-green-800 mb-1">Plan</p>
                  <p className="text-lg font-semibold text-green-900">{subscription.planName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 mb-1">Status</p>
                  <Badge variant={getStatusBadgeVariant(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 mb-1">Amount</p>
                  <p className="text-lg font-semibold text-green-900">
                    {formatCurrency(subscription.amount, subscription.currency)}/
                    {subscription.interval}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 mb-1">Next Billing</p>
                  <p className="text-lg font-semibold text-green-900">
                    {formatDate(subscription.nextBillingDate)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-green-800 mb-1">Email</p>
                  <p className="text-lg font-semibold text-green-900">
                    {subscription.customerEmail}
                  </p>
                </div>
                {paymentMethod && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-green-800 mb-1">Payment Method</p>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-green-700" />
                      <p className="text-lg font-semibold text-green-900">
                        {paymentMethod.type === 'us_bank_account'
                          ? 'Bank Account (ACH)'
                          : 'Credit/Debit Card'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Clock className="w-6 h-6 text-blue-600 mr-3" />
                What happens next?
              </CardTitle>
              <CardDescription>Your account setup process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div
                  className={`${
                    isACHPayment() ? 'bg-blue-100' : 'bg-green-100'
                  } rounded-full p-1 mt-1`}
                >
                  {isACHPayment() ? (
                    <Clock className="w-4 h-4 text-blue-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {isACHPayment() ? '⏳ Payment Processing' : '✅ Payment Confirmed'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {isACHPayment()
                      ? 'Your ACH payment is being processed (3-5 business days)'
                      : 'Your subscription is now active'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Account Access</p>
                  <p className="text-gray-600 text-sm">
                    You can now access your dashboard and all features
                  </p>
                </div>
              </div>

              {isACHPayment() && (
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 rounded-full p-1 mt-1">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Payment Settlement</p>
                    <p className="text-gray-600 text-sm">
                      Final confirmation after ACH clears (~
                      {formatDate(getACHSettlementDate().toISOString())})
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Welcome Email</p>
                  <p className="text-gray-600 text-sm">Check your inbox for setup instructions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CreditCard className="w-6 h-6 text-green-600 mr-3" />
                Subscription Details
              </CardTitle>
              <CardDescription>Your billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-semibold">{subscription.planName}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Billing:</span>
                    <span className="font-semibold">
                      {formatCurrency(subscription.amount, subscription.currency)}/
                      {subscription.interval}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Next billing:
                    </span>
                    <span className="font-semibold">
                      {formatDate(subscription.nextBillingDate)}
                    </span>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      Subscription ID: {subscription.id.slice(-8)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Your EZMedTech dashboard is ready! Start managing your healthcare practice with our
            powerful tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="flex items-center">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/contact">
              <Button variant="outline" size="lg" className="flex items-center">
                Contact Support
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" size="lg" className="flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Questions about your subscription?
            </h3>
            <p className="text-gray-600 mb-4">
              Contact our billing team at{' '}
              <a href="mailto:billing@ezmedtech.com" className="text-blue-600 hover:underline">
                billing@ezmedtech.com
              </a>{' '}
              or call{' '}
              <a href="tel:1-800-EZMEDTECH" className="text-blue-600 hover:underline">
                1-800-EZMEDTECH
              </a>
            </p>
            <p className="text-sm text-gray-500">
              You can manage your subscription anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function SuccessPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 rounded-full p-4">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-lg text-gray-600">
            Please wait while we load your subscription details.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessPageLoading />}>
      <SuccessPageContent />
    </Suspense>
  );
}
