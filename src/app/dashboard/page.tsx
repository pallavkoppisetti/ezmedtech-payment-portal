'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/shared/Navigation';

interface SessionData {
  id: string;
  status: string;
  customerEmail: string;
  planName: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(!!sessionId);

  useEffect(() => {
    if (sessionId) {
      // Here you would typically fetch session data from your API
      // For now, we'll just simulate it
      setTimeout(() => {
        setSessionData({
          id: sessionId,
          status: 'complete',
          customerEmail: 'user@example.com',
          planName: 'Professional Plan',
        });
        setIsLoading(false);
      }, 1500);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {sessionId && (
          <div className="mb-8">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Processing Your Subscription
                </h2>
                <p className="text-gray-600">
                  Please wait while we confirm your payment and set up your account.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-green-900">
                      🎉 Welcome to EZMedTech!
                    </h2>
                    <p className="text-green-700 mt-1">
                      Your subscription has been successfully activated. You now have access to all features.
                    </p>
                    {sessionData && (
                      <div className="mt-4 text-sm text-green-600">
                        <p>Plan: <span className="font-medium">{sessionData.planName}</span></p>
                        <p>Session ID: <span className="font-mono">{sessionData.id}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Patients</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Subscriptions</span>
                <span className="font-semibold">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan Status</span>
                <span className="text-green-600 font-semibold">Active</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Subscription activated</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Account created</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Welcome email sent</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Add Patient
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                View Reports
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Setup Profile</h3>
              <p className="text-sm text-gray-600">Complete your practice information and preferences</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Add Patients</h3>
              <p className="text-sm text-gray-600">Start adding your patient records to the system</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Customize</h3>
              <p className="text-sm text-gray-600">Configure your dashboard and reporting preferences</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Go Live</h3>
              <p className="text-sm text-gray-600">Start managing your practice with EZMedTech</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
