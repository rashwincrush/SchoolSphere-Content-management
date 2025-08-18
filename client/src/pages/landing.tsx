import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { School, Users, Calendar, BarChart3 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-roboto-slab font-bold text-gray-900 mb-6">
            EduConnect
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive multi-branch school management system with event management, 
            social media automation, and multilingual support.
          </p>
          <Button
            size="lg"
            className="bg-primary-700 hover:bg-primary-800 text-white px-8 py-3"
            onClick={() => {
              // Add timestamp to bust cache and force fresh request
              const loginUrl = `/api/login?t=${Date.now()}`;
              // Use location.replace for clean navigation history
              window.location.replace(loginUrl);
            }}
          >
            Sign In to Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center shadow-material-2">
            <CardHeader>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <School className="w-8 h-8 text-primary-700" />
              </div>
              <CardTitle className="text-lg">Multi-Branch Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Manage multiple school branches from a single, unified dashboard.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-material-2">
            <CardHeader>
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-secondary-700" />
              </div>
              <CardTitle className="text-lg">Event Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create, schedule, and manage events with RSVP functionality and automated notifications.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-material-2">
            <CardHeader>
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-warning-700" />
              </div>
              <CardTitle className="text-lg">Social Media Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automate social media posts and preview content across multiple platforms.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-material-2">
            <CardHeader>
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-success-700" />
              </div>
              <CardTitle className="text-lg">Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track engagement, attendance, and performance across all branches.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-roboto-slab font-bold text-gray-900 mb-4">
            Ready to Transform Your School Management?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of educators already using EduConnect to streamline their operations.
          </p>
          <Button
            size="lg"
            className="bg-secondary-700 hover:bg-secondary-800 text-white px-8 py-3"
            onClick={() => {
              // Add timestamp to bust cache and force fresh request
              const loginUrl = `/api/login?t=${Date.now()}`;
              // Use location.replace for clean navigation history
              window.location.replace(loginUrl);
            }}
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
}
