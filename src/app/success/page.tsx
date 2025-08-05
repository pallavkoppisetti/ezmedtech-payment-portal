'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/shared/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // In a real app, you might want to verify the session with your backend
    // and get customer details
    if (sessionId) {
      // You could make an API call here to get session details
      console.log('Checkout session ID:', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navigation />
      
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
            Thank you for subscribing! Your payment was successful and your account is being set up.
          </p>

          {sessionId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto mb-8">
              <p className="text-sm text-green-800">
                <strong>Confirmation ID:</strong> {sessionId.slice(-8)}
              </p>
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
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Account Activation</p>
                  <p className="text-gray-600 text-sm">Your account will be activated within 5 minutes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Welcome Email</p>
                  <p className="text-gray-600 text-sm">Check your inbox for setup instructions and login details</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Onboarding Call</p>
                  <p className="text-gray-600 text-sm">Our team will schedule a personalized setup call</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                Your Benefits
              </CardTitle>
              <CardDescription>
                What you get with your subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-900">Full access to EZMedTech platform</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-900">HIPAA-compliant patient management</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-900">24/7 customer support</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-900">Mobile app access</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-900">Advanced analytics and reporting</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need Help Getting Started?
          </h2>
          <p className="text-gray-600 mb-6">
            Our healthcare technology experts are here to help you set up your practice for success.
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
