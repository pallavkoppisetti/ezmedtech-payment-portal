'use client';

import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about EZMedTech? Our healthcare technology experts are here to help 
            you find the perfect solution for your medical practice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Mail className="w-6 h-6 text-blue-600 mr-3" />
                  Email Support
                </CardTitle>
                <CardDescription>
                  Get in touch with our support team for technical assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900">support@ezmedtech.com</p>
                <p className="text-gray-600 mt-2">Response time: Within 2 hours</p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Phone className="w-6 h-6 text-green-600 mr-3" />
                  Phone Support
                </CardTitle>
                <CardDescription>
                  Speak directly with our healthcare technology specialists
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900">1-800-EZMEDTECH</p>
                <p className="text-gray-600 mt-2">Available 24/7 for urgent issues</p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="w-6 h-6 text-purple-600 mr-3" />
                  Office Location
                </CardTitle>
                <CardDescription>
                  Visit our headquarters for in-person consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900">
                  123 Healthcare Ave<br />
                  Medical District, CA 90210
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Clock className="w-6 h-6 text-orange-600 mr-3" />
                  Business Hours
                </CardTitle>
                <CardDescription>
                  Our standard support hours (Emergency support available 24/7)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><span className="font-semibold">Monday - Friday:</span> 8:00 AM - 8:00 PM PST</p>
                  <p><span className="font-semibold">Saturday:</span> 9:00 AM - 5:00 PM PST</p>
                  <p><span className="font-semibold">Sunday:</span> Emergency support only</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="p-8">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we&apos;ll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Practice Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select your practice type</option>
                    <option>Family Medicine</option>
                    <option>Internal Medicine</option>
                    <option>Pediatrics</option>
                    <option>Cardiology</option>
                    <option>Dermatology</option>
                    <option>Other Specialty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about your practice and how we can help..."
                  ></textarea>
                </div>

                <Button className="w-full" size="lg">
                  Send Message
                </Button>

                <p className="text-sm text-gray-600 text-center">
                  By submitting this form, you agree to our Privacy Policy and Terms of Service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-lg">How quickly can we get started?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Most practices can be up and running within 24-48 hours. Our team provides 
                  full setup assistance and data migration support.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-lg">Is training included?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! We provide comprehensive training for your entire team, including 
                  ongoing support and refresher sessions as needed.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-lg">What about data security?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  EZMedTech is fully HIPAA compliant with enterprise-grade security, 
                  end-to-end encryption, and regular security audits.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-lg">Can we integrate with existing systems?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely! We support integration with most major EHR systems, 
                  practice management software, and third-party applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
