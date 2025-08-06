'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Types for user state - replace with actual auth types later
interface User {
  id: string;
  name: string;
  email: string;
  subscription?: {
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
    planName: string;
  };
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const pathname = usePathname();

  // Mock user state - replace with actual auth logic later
  useEffect(() => {
    // Simulate checking authentication state
    const checkAuth = async () => {
      try {
        // Mock user data - replace with real API call
        const mockUser: User = {
          id: 'user_123',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@example.com',
          subscription: {
            status: 'active',
            planName: 'Professional',
          },
        };
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set user if on dashboard or success page (simulating authenticated state)
        if (pathname === '/dashboard' || pathname === '/success') {
          setUser(mockUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  // Handle billing portal
  const handleBillingPortal = async () => {
    if (!user?.id) return;
    
    try {
      setPortalLoading(true);
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: 'cus_test_123', // Replace with actual customer ID from user data
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to Stripe customer portal
        window.location.href = result.portal_url;
      } else {
        console.error('Portal creation failed:', result.error);
        // You could use a toast notification here instead of alert
        alert(`Failed to open billing portal: ${result.error}`);
      }
    } catch (err) {
      console.error('Error opening portal:', err);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
      setIsUserMenuOpen(false);
    }
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle user menu toggle
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
    };

    if (isMobileMenuOpen || isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen, isUserMenuOpen]);

  // Navigation items based on user state
  const getNavigationItems = () => {
    const baseItems = [
      { href: '/', label: 'Home' },
      { href: '/pricing', label: 'Pricing' },
    ];

    if (user?.subscription?.status === 'active') {
      baseItems.push({ href: '/dashboard', label: 'Dashboard' });
    }

    return baseItems;
  };

  // Get active link styling
  const getLinkClassName = (href: string) => {
    const isActive = pathname === href;
    return `relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
    }`;
  };

  // Get mobile link styling
  const getMobileLinkClassName = (href: string) => {
    const isActive = pathname === href;
    return `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
      isActive
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
    }`;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-2 mr-3 shadow-sm">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.5 3.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75V4.5a.75.75 0 0 1 .75-.75h4.5ZM4.5 8.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5ZM19.5 14.25a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75h4.5Z"/>
                <path d="M12 4.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 1 .75-.75ZM4.5 19.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              EZMed<span className="text-blue-600">Tech</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {getNavigationItems().map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getLinkClassName(item.href)}
              >
                {item.label}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoading ? (
              // Loading state
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              // Authenticated user menu
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUserMenu();
                  }}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {user.subscription && (
                      <p className="text-xs text-gray-500">{user.subscription.planName}</p>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      disabled={portalLoading}
                      onClick={() => {
                        handleBillingPortal();
                        setIsUserMenuOpen(false);
                      }}
                    >
                      {portalLoading ? 'Loading...' : 'Billing Portal'}
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => {
                        // Add logout logic here
                        setUser(null);
                        console.log('Logout');
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Non-authenticated CTA
              <Link
                href="/pricing"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMobileMenu();
              }}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {getNavigationItems().map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getMobileLinkClassName(item.href)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile user section */}
          {!isLoading && (
            <div className="border-t border-gray-200 pt-4 pb-3">
              {user ? (
                <div className="px-2 space-y-1">
                  <div className="flex items-center px-3 py-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.subscription && (
                        <p className="text-xs text-blue-600">{user.subscription.planName} Plan</p>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={portalLoading}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleBillingPortal();
                    }}
                  >
                    {portalLoading ? 'Loading...' : 'Billing Portal'}
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setUser(null);
                      console.log('Logout');
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="px-2">
                  <Link
                    href="/pricing"
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
