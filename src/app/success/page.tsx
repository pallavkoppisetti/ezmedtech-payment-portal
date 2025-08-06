'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, ArrowRight, Home, AlertCircle, Loader2, CreditCard, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  error?: string;
  details?: string;
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
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
        } else {
          // Handle specific error cases
          if (response.status === 404) {
            setError('This checkout session has expired or is no longer valid. Sessions expire after 24 hours. Please create a new checkout session.');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  Back to Pricing
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg">
                  Contact Support
                </Button>
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
            Thank you for subscribing! Your payment was successful and your account is ready.
          </p>

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
                    {formatCurrency(subscription.amount, subscription.currency)}/{subscription.interval}
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
                  <p className="text-lg font-semibold text-green-900">{subscription.customerEmail}</p>
                </div>
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
              <CardDescription>
                Your account setup process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">✅ Payment Confirmed</p>
                  <p className="text-gray-600 text-sm">Your subscription is now active</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Account Access</p>
                  <p className="text-gray-600 text-sm">You can now access your dashboard and all features</p>
                </div>
              </div>
              
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
              <CardDescription>
                Your billing information
              </CardDescription>
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
                      {formatCurrency(subscription.amount, subscription.currency)}/{subscription.interval}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6">
            Your EZMedTech dashboard is ready! Start managing your healthcare practice with our powerful tools.
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
