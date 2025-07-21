import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { EventCard } from '@/components/events/EventCard';
import { SocialPostPreview } from '@/components/social/SocialPostPreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { Calendar, Users, Share2, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useBranch } from '@/context/BranchContext';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { EventForm } from '@/components/events/EventForm';

export default function Dashboard() {
  const { t } = useLanguage();
  const { selectedBranchId, selectedBranch } = useBranch();
  const { user } = useAuth();
  const [showEventForm, setShowEventForm] = useState(false);

  // Fetch data
  const { data: events = [] } = useQuery<any[]>({
    queryKey: ['/api/events', selectedBranchId],
  });

  const { data: posts = [] } = useQuery<any[]>({
    queryKey: ['/api/posts', selectedBranchId],
  });

  const { data: eventStats } = useQuery<any>({
    queryKey: ['/api/analytics/events', selectedBranchId],
  });

  const { data: socialStats } = useQuery<any>({
    queryKey: ['/api/analytics/social', selectedBranchId],
  });

  const { data: userStats } = useQuery<any>({
    queryKey: ['/api/analytics/users', selectedBranchId],
  });

  // Get upcoming events (next 5)
  const upcomingEvents = events
    .filter((event: any) => new Date(event.startDate) >= new Date())
    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  // Get recent posts (last 3)
  const recentPosts = posts
    .filter((post: any) => post.isPublished)
    .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  return (
    <AppShell>
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-roboto-slab font-bold text-gray-900 mb-2">
              {t('dashboard')}
            </h1>
            <p className="text-gray-600">
              {t('welcomeBack')}, {(user as any)?.firstName || 'User'} - {selectedBranch?.name || 'All Branches'}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowEventForm(true)}
              className="bg-primary-700 text-white hover:bg-primary-800 shadow-material-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('createEvent')}
            </Button>
            
            <Button
              variant="secondary"
              className="bg-secondary-700 text-white hover:bg-secondary-800 shadow-material-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('newPost')}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title={t('totalEvents')}
          value={eventStats?.totalEvents || 0}
          change="+12% from last month"
          icon={<Calendar className="w-6 h-6 text-primary-700" />}
          iconBgColor="bg-primary-50"
        />
        
        <StatsCard
          title={t('activeUsers')}
          value={userStats?.totalUsers || 0}
          change="+8% from last month"
          icon={<Users className="w-6 h-6 text-secondary-700" />}
          iconBgColor="bg-secondary-50"
        />
        
        <StatsCard
          title={t('socialPosts')}
          value={socialStats?.totalPosts || 0}
          change="+24% from last month"
          icon={<Share2 className="w-6 h-6 text-warning-700" />}
          iconBgColor="bg-warning-50"
        />
        
        <StatsCard
          title={t('engagement')}
          value="94%"
          change="+5% from last month"
          icon={<TrendingUp className="w-6 h-6 text-success-700" />}
          iconBgColor="bg-success-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Upcoming Events */}
        <Card className="shadow-material-1">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle>{t('upcomingEvents')}</CardTitle>
              <Button variant="link" size="sm" className="text-primary-700">
                {t('viewAll')}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No upcoming events
                </p>
              ) : (
                upcomingEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Preview */}
        <Card className="shadow-material-1">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle>Social Media</CardTitle>
              <Button
                size="sm"
                className="bg-secondary-700 text-white hover:bg-secondary-800"
              >
                {t('schedulePost')}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No recent posts
                </p>
              ) : (
                recentPosts.map((post: any) => (
                  <SocialPostPreview key={post.id} post={post} platform="facebook" />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="shadow-material-1">
          <CardHeader className="border-b border-gray-200">
            <CardTitle>{t('quickActions')}</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full bg-primary-50 border-primary-200 hover:bg-primary-100 justify-start h-auto p-4"
                onClick={() => setShowEventForm(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{t('createEvent')}</h3>
                    <p className="text-sm text-gray-600">Schedule a new event for your branch</p>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full bg-secondary-50 border-secondary-200 hover:bg-secondary-100 justify-start h-auto p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary-700 rounded-lg flex items-center justify-center">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Write Post</h3>
                    <p className="text-sm text-gray-600">Create content for social media</p>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full bg-warning-50 border-warning-200 hover:bg-warning-100 justify-start h-auto p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning-700 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{t('manageUsers')}</h3>
                    <p className="text-sm text-gray-600">Add or edit user accounts</p>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full bg-success-50 border-success-200 hover:bg-success-100 justify-start h-auto p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success-700 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{t('viewAnalytics')}</h3>
                    <p className="text-sm text-gray-600">Check engagement and metrics</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>

      {/* Event Form Modal */}
      <EventForm
        open={showEventForm}
        onOpenChange={setShowEventForm}
      />
    </AppShell>
  );
}
