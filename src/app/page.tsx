import Link from "next/link";
import { ArrowRight, Shield, Zap, Users, Activity, Heart, CheckCircle, Star } from "lucide-react";
import Navigation from "@/components/shared/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-green-600/5" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <Badge variant="secondary" className="mb-8 text-sm px-4 py-2 bg-blue-100 text-blue-800 border-blue-200">
              <Heart className="w-4 h-4 mr-2" />
              Healthcare SaaS Platform
            </Badge>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Streamline Your 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                {" "}Medical Practice
              </span>
            </h1>
            
            {/* Value Proposition */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your healthcare practice with EZMedTech&apos;s comprehensive patient management platform. 
              HIPAA-compliant, secure, and designed to help medical professionals deliver better patient care 
              while reducing administrative burden.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/pricing">
                <Button size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-16">
              <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-sm border">
                <Shield className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">HIPAA Compliant</span>
              </div>
              <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-sm border">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">30-Day Free Trial</span>
              </div>
              <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-sm border">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">5-Star Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools modern healthcare practices 
              need to deliver exceptional patient care and streamline operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Patient Management</CardTitle>
                <CardDescription>
                  Comprehensive patient records, medical history tracking, and appointment scheduling 
                  all in one secure platform.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">HIPAA Compliance</CardTitle>
                <CardDescription>
                  Enterprise-grade security with end-to-end encryption, audit trails, 
                  and compliance monitoring to protect patient data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Lightning Fast</CardTitle>
                <CardDescription>
                  Cloud-based platform with 99.9% uptime, instant data sync, 
                  and optimized performance for busy medical practices.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Team Collaboration</CardTitle>
                <CardDescription>
                  Enable seamless collaboration between doctors, nurses, and staff 
                  with role-based access and real-time updates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-pink-200">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-xl">Patient Experience</CardTitle>
                <CardDescription>
                  Improve patient satisfaction with online booking, automated reminders, 
                  and patient portal for easy access to medical information.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-indigo-200">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                  <CheckCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Easy Integration</CardTitle>
                <CardDescription>
                  Seamlessly integrate with existing healthcare systems, EHRs, 
                  and third-party applications through our robust API.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Healthcare Professionals</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50M+</div>
              <div className="text-blue-100">Patient Records Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Trusted by Healthcare Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what medical professionals are saying about EZMedTech
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8">
              <CardHeader className="pb-4">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
                <CardDescription className="text-lg text-gray-700 italic">
                  &quot;EZMedTech has transformed our practice. Patient management is now seamless, 
                  and our team can focus on what matters most - providing excellent care.&quot;
                </CardDescription>
              </CardHeader>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Dr. Sarah Johnson</div>
                  <div className="text-gray-600">Family Medicine Physician</div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <CardHeader className="pb-4">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
                <CardDescription className="text-lg text-gray-700 italic">
                  &quot;The HIPAA compliance features give us peace of mind, and the intuitive 
                  interface made training our staff incredibly easy.&quot;
                </CardDescription>
              </CardHeader>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Dr. Michael Chen</div>
                  <div className="text-gray-600">Pediatric Specialist</div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <CardHeader className="pb-4">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
                <CardDescription className="text-lg text-gray-700 italic">
                  &quot;Outstanding support team and continuous updates. EZMedTech grows with our 
                  practice and anticipates our needs.&quot;
                </CardDescription>
              </CardHeader>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Dr. Emily Rodriguez</div>
                  <div className="text-gray-600">Internal Medicine</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who have streamlined their workflow 
            and improved patient care with EZMedTech.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-10 py-6 h-auto w-full sm:w-auto">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 h-auto w-full sm:w-auto">
                View All Plans
              </Button>
            </Link>
          </div>
          <p className="text-blue-100 text-sm mt-6">
            No credit card required • 30-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
