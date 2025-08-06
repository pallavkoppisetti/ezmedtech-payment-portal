'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRICING_TIERS } from '@/lib/stripe/products';

// Types for dashboard data
interface SubscriptionStatus {
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
  planId: string;
  planName: string;
  planPrice: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  nextBillingAmount: number;
  customerId: string;
  subscriptionId: string;
}

interface PaymentMethod {
  type: 'card' | 'bank_account';
  brand?: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
}

interface UsageStats {
  patients: {
    current: number;
    limit: number | 'unlimited';
  };
  apiCalls: {
    current: number;
    limit: number | 'unlimited';
  };
  storage: {
    current: number; // in GB
    limit: number; // in GB
  };
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

interface DashboardData {
  subscription: SubscriptionStatus;
  paymentMethod: PaymentMethod;
  usage: UsageStats;
  invoices: Invoice[];
}

// Mock data - replace with real Stripe API calls later
const mockDashboardData: DashboardData = {
  subscription: {
    status: 'active',
    planId: 'pro',
    planName: 'Professional',
    planPrice: 79,
    billingCycle: 'monthly',
    nextBillingDate: '2025-09-05',
    nextBillingAmount: 79,
    customerId: 'cus_test_123',
    subscriptionId: 'sub_test_456',
  },
  paymentMethod: {
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2028,
  },
  usage: {
    patients: {
      current: 245,
      limit: 500,
    },
    apiCalls: {
      current: 1850,
      limit: 10000,
    },
    storage: {
      current: 2.3,
      limit: 50,
    },
  },
  invoices: [
    {
      id: 'in_test_001',
      date: '2025-08-05',
      amount: 79,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'in_test_002',
      date: '2025-07-05',
      amount: 79,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'in_test_003',
      date: '2025-06-05',
      amount: 79,
      status: 'paid',
      downloadUrl: '#',
    },
  ],
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    // Simulate API call - replace with real Stripe data fetching later
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData(mockDashboardData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle opening Stripe customer portal
  const handleManageBilling = async () => {
    if (!data?.subscription.customerId) return;
    
    try {
      setPortalLoading(true);
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: data.subscription.customerId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to Stripe customer portal
        window.location.href = result.portal_url;
      } else {
        console.error('Portal creation failed:', result.error);
        alert(`Failed to open billing portal: ${result.error}`);
      }
    } catch (err) {
      console.error('Error opening portal:', err);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  // Get current plan details
  const currentPlan = data ? PRICING_TIERS.find(tier => tier.id === data.subscription.planId) : null;

  // Status badge variant mapping
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trialing':
        return 'secondary';
      case 'past_due':
        return 'destructive';
      case 'canceled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate usage percentage
  const getUsagePercentage = (current: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0;
    return Math.min((current / limit) * 100, 100);
  };

  // Get usage color
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and billing</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and billing</p>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button 
              className="mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your subscription and billing</p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Subscription Status Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Subscription Status
              <Badge variant={getStatusBadgeVariant(data.subscription.status)}>
                {data.subscription.status.charAt(0).toUpperCase() + data.subscription.status.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Current Plan</p>
                <p className="font-semibold text-lg">{data.subscription.planName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Billing Cycle</p>
                <p className="font-medium capitalize">{data.subscription.billingCycle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Billing Date</p>
                <p className="font-medium">{formatDate(data.subscription.nextBillingDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Billing Amount</p>
                <p className="font-semibold text-lg">{formatCurrency(data.subscription.nextBillingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>Features included in your current plan</CardDescription>
          </CardHeader>
          <CardContent>
            {currentPlan && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="font-semibold">{formatCurrency(currentPlan.price.monthly)}/month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Patients</span>
                  <span className="font-medium">
                    {currentPlan.maxPatients === 'unlimited' ? 'Unlimited' : currentPlan.maxPatients}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Support</span>
                  <span className="font-medium capitalize">{currentPlan.supportLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Analytics</span>
                  <span className="font-medium capitalize">{currentPlan.analytics}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">API Access</span>
                  <Badge variant={currentPlan.apiAccess ? 'default' : 'outline'}>
                    {currentPlan.apiAccess ? 'Included' : 'Not Included'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {data.paymentMethod.brand?.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• {data.paymentMethod.last4}</p>
                  {data.paymentMethod.expMonth && data.paymentMethod.expYear && (
                    <p className="text-sm text-gray-600">
                      Expires {data.paymentMethod.expMonth.toString().padStart(2, '0')}/{data.paymentMethod.expYear}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics Card */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Current usage across your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              
              {/* Patients Usage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Patients</span>
                  <span className="text-sm font-semibold">
                    {data.usage.patients.current} / {data.usage.patients.limit === 'unlimited' ? '∞' : data.usage.patients.limit}
                  </span>
                </div>
                {data.usage.patients.limit !== 'unlimited' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage(data.usage.patients.current, data.usage.patients.limit) >= 90
                          ? 'bg-red-600'
                          : getUsagePercentage(data.usage.patients.current, data.usage.patients.limit) >= 75
                          ? 'bg-yellow-500'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${getUsagePercentage(data.usage.patients.current, data.usage.patients.limit)}%` }}
                    />
                  </div>
                )}
                <p className={`text-xs ${getUsageColor(getUsagePercentage(data.usage.patients.current, data.usage.patients.limit))}`}>
                  {data.usage.patients.limit !== 'unlimited' 
                    ? `${getUsagePercentage(data.usage.patients.current, data.usage.patients.limit).toFixed(1)}% used`
                    : 'Unlimited'
                  }
                </p>
              </div>

              {/* API Calls Usage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">API Calls</span>
                  <span className="text-sm font-semibold">
                    {data.usage.apiCalls.current.toLocaleString()} / {data.usage.apiCalls.limit === 'unlimited' ? '∞' : data.usage.apiCalls.limit.toLocaleString()}
                  </span>
                </div>
                {data.usage.apiCalls.limit !== 'unlimited' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage(data.usage.apiCalls.current, data.usage.apiCalls.limit) >= 90
                          ? 'bg-red-600'
                          : getUsagePercentage(data.usage.apiCalls.current, data.usage.apiCalls.limit) >= 75
                          ? 'bg-yellow-500'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${getUsagePercentage(data.usage.apiCalls.current, data.usage.apiCalls.limit)}%` }}
                    />
                  </div>
                )}
                <p className={`text-xs ${getUsageColor(getUsagePercentage(data.usage.apiCalls.current, data.usage.apiCalls.limit))}`}>
                  {data.usage.apiCalls.limit !== 'unlimited' 
                    ? `${getUsagePercentage(data.usage.apiCalls.current, data.usage.apiCalls.limit).toFixed(1)}% used`
                    : 'Unlimited'
                  }
                </p>
              </div>

              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Storage</span>
                  <span className="text-sm font-semibold">
                    {data.usage.storage.current} GB / {data.usage.storage.limit} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      getUsagePercentage(data.usage.storage.current, data.usage.storage.limit) >= 90
                        ? 'bg-red-600'
                        : getUsagePercentage(data.usage.storage.current, data.usage.storage.limit) >= 75
                        ? 'bg-yellow-500'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${getUsagePercentage(data.usage.storage.current, data.usage.storage.limit)}%` }}
                  />
                </div>
                <p className={`text-xs ${getUsageColor(getUsagePercentage(data.usage.storage.current, data.usage.storage.limit))}`}>
                  {getUsagePercentage(data.usage.storage.current, data.usage.storage.limit).toFixed(1)}% used
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Billing History Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Billing History</CardTitle>
            <CardDescription>Your last 3 invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{formatDate(invoice.date)}</p>
                      <p className="text-sm text-gray-600">Invoice #{invoice.id.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : invoice.status === 'pending' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                    {invoice.downloadUrl && (
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button 
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center block"
            >
              {portalLoading ? 'Opening Portal...' : 'Manage Billing'}
            </button>
            <Link href="/pricing" className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-center block">
              Change Plan
            </Link>
            <button 
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => {
                // Create a downloadable file with invoice data
                const csvContent = [
                  'Date,Invoice ID,Amount,Status',
                  ...data.invoices.map(inv => 
                    `${inv.date},${inv.id},${inv.amount},${inv.status}`
                  )
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'invoices.csv';
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              Download Invoices
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}