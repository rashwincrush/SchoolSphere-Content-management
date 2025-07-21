import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventTemplates } from '@/components/templates/EventTemplates';
import { PostTemplates } from '@/components/templates/PostTemplates';
import { ParentPortal } from '@/components/parent/ParentPortal';
import { EventScheduler } from '@/components/scheduling/EventScheduler';
import { RSVPManager } from '@/components/rsvp/RSVPManager';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { 
  Calendar, 
  FileText, 
  Users, 
  Bell, 
  Settings, 
  Heart,
  Zap,
  Target,
  BookOpen,
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function FeatureHub() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [eventSchedulerData, setEventSchedulerData] = useState<any>(null);

  const features = [
    {
      id: 'event-templates',
      title: 'Event Templates',
      description: 'Pre-designed templates for different types of school events',
      icon: Calendar,
      category: 'Events',
      status: 'active',
      benefits: ['Save time', 'Consistent messaging', 'Professional quality'],
      usage: 'Create events quickly using proven templates for academics, sports, and cultural activities'
    },
    {
      id: 'post-templates',
      title: 'Social Media Templates',
      description: 'Ready-to-use templates for social media posts and announcements',
      icon: FileText,
      category: 'Content',
      status: 'active',
      benefits: ['Brand consistency', 'Quick posting', 'Engaging content'],
      usage: 'Generate professional social media content with pre-written templates'
    },
    {
      id: 'parent-portal',
      title: 'Parent Portal',
      description: 'Personalized dashboard for parents to track their children\'s progress',
      icon: Users,
      category: 'Communication',
      status: 'active',
      benefits: ['Parent engagement', 'Real-time updates', 'Academic tracking'],
      usage: 'Provide parents with comprehensive view of their children\'s activities and progress'
    },
    {
      id: 'event-scheduler',
      title: 'Advanced Event Scheduler',
      description: 'Comprehensive event scheduling with automation and reminders',
      icon: Clock,
      category: 'Events',
      status: 'active',
      benefits: ['Automated reminders', 'Social media integration', 'RSVP management'],
      usage: 'Schedule events with automatic notifications, social media posting, and RSVP tracking'
    },
    {
      id: 'rsvp-manager',
      title: 'RSVP Management',
      description: 'Track attendance and manage event responses efficiently',
      icon: CheckCircle,
      category: 'Events',
      status: 'active',
      benefits: ['Response tracking', 'Automated reminders', 'Attendance analytics'],
      usage: 'Manage event attendance with automated follow-ups and comprehensive reporting'
    },
    {
      id: 'notification-center',
      title: 'Notification Center',
      description: 'Centralized system for all school communications and alerts',
      icon: Bell,
      category: 'Communication',
      status: 'active',
      benefits: ['Real-time alerts', 'Priority management', 'Read receipts'],
      usage: 'Send and manage notifications for events, emergencies, and general announcements'
    }
  ];

  const categories = ['All', 'Events', 'Content', 'Communication'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFeatures = features.filter(feature => 
    selectedCategory === 'All' || feature.category === selectedCategory
  );

  const handleFeatureSelect = (featureId: string) => {
    setActiveFeature(featureId);
  };

  const handleEventTemplateSelect = (template: any) => {
    setEventSchedulerData({
      title: template.title,
      description: template.description,
      category: template.category,
      location: template.suggestedLocation,
      reminderDays: template.defaultReminders,
      socialMessage: template.socialMediaTemplate,
      emailMessage: template.emailTemplate
    });
    setActiveFeature('event-scheduler');
  };

  const handlePostTemplateSelect = (template: any) => {
    // Here you would navigate to the content creation page with the template
    console.log('Selected post template:', template);
  };

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'event-templates':
        return (
          <EventTemplates
            onSelectTemplate={handleEventTemplateSelect}
            onCreateCustom={() => setActiveFeature('event-scheduler')}
          />
        );
      case 'post-templates':
        return (
          <PostTemplates
            onSelectTemplate={handlePostTemplateSelect}
            onCreateCustom={() => setActiveFeature(null)}
          />
        );
      case 'parent-portal':
        return <ParentPortal />;
      case 'event-scheduler':
        return (
          <EventScheduler
            initialData={eventSchedulerData}
            onSubmit={(data) => {
              console.log('Event scheduled:', data);
              setActiveFeature(null);
              setEventSchedulerData(null);
            }}
            onCancel={() => {
              setActiveFeature(null);
              setEventSchedulerData(null);
            }}
          />
        );
      case 'rsvp-manager':
        return <RSVPManager eventId={1} />;
      default:
        return null;
    }
  };

  if (activeFeature) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setActiveFeature(null);
                setEventSchedulerData(null);
              }}
            >
              ← Back to Feature Hub
            </Button>
          </div>
          {renderFeatureContent()}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Hub</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Access advanced features and tools to streamline your school management operations. 
            These components are designed to save time, improve communication, and enhance the overall experience.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">15+</h3>
              <p className="text-sm text-gray-600">Event Templates</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">20+</h3>
              <p className="text-sm text-gray-600">Post Templates</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg">100%</h3>
              <p className="text-sm text-gray-600">Parent Engagement</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg">50%</h3>
              <p className="text-sm text-gray-600">Time Saved</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="px-4"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map(feature => {
            const IconComponent = feature.icon;
            
            return (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                        <IconComponent className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {feature.category}
                        </Badge>
                      </div>
                    </div>
                    <Badge 
                      variant={feature.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {feature.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Key Benefits:</h4>
                    <div className="flex flex-wrap gap-1">
                      {feature.benefits.map(benefit => (
                        <Badge key={benefit} variant="outline" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Use Case:</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {feature.usage}
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full group-hover:bg-primary-700 transition-colors"
                    onClick={() => handleFeatureSelect(feature.id)}
                  >
                    Launch Feature
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Getting Started Guide */}
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary-200 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-primary-900 mb-2">
                  Getting Started with Advanced Features
                </h3>
                <p className="text-primary-700 mb-4">
                  These advanced features are designed to work together seamlessly. Start with event templates, 
                  use the scheduler for automation, and engage parents through the portal.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-primary-600" />
                    <span>Choose from 15+ event templates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span>Automate scheduling and reminders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-primary-600" />
                    <span>Keep parents engaged and informed</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}