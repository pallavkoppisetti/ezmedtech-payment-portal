'use client';

import React from 'react';
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="bg-blue-600 rounded-lg p-2 mr-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              EZMed<span className="text-blue-600">Tech</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="text-blue-600 font-medium">
              Pricing
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Link
              href="/pricing"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
