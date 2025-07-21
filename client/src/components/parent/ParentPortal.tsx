import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  User, 
  Bell, 
  BookOpen, 
  Trophy, 
  MessageSquare,
  Clock,
  MapPin,
  Star,
  Heart,
  Download
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ParentPortalProps {
  studentId?: string;
}

export function ParentPortal({ studentId }: ParentPortalProps) {
  const [selectedChild, setSelectedChild] = useState(studentId);

  // Mock data for demonstration - in real app, these would come from API
  const { data: children = [] } = useQuery({
    queryKey: ['/api/parent/children'],
    queryFn: async () => [
      {
        id: '1',
        firstName: 'Emma',
        lastName: 'Johnson',
        grade: '5th Grade',
        class: '5A',
        teacher: 'Ms. Rodriguez',
        avatar: null,
        branch: 'Main Campus'
      },
      {
        id: '2',
        firstName: 'Liam',
        lastName: 'Johnson',
        grade: '3rd Grade',
        class: '3B',
        teacher: 'Mr. Thompson',
        avatar: null,
        branch: 'Main Campus'
      }
    ]
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['/api/parent/events', selectedChild],
    queryFn: async () => [
      {
        id: 1,
        title: 'Science Fair',
        date: '2025-01-28',
        time: '10:00 AM',
        location: 'School Gymnasium',
        category: 'academic',
        rsvpRequired: true,
        rsvpStatus: 'pending'
      },
      {
        id: 2,
        title: 'Parent-Teacher Conference',
        date: '2025-02-05',
        time: '2:00 PM',
        location: 'Classroom 5A',
        category: 'academic',
        rsvpRequired: true,
        rsvpStatus: 'confirmed'
      }
    ]
  });

  const { data: recentAnnouncements = [] } = useQuery({
    queryKey: ['/api/parent/announcements', selectedChild],
    queryFn: async () => [
      {
        id: 1,
        title: 'Updated School Calendar',
        content: 'Please review the updated calendar for upcoming holidays and events.',
        type: 'academic',
        createdAt: '2025-01-20T10:00:00Z',
        priority: 'medium'
      },
      {
        id: 2,
        title: 'Lunch Menu Changes',
        content: 'New healthy options have been added to our lunch menu starting next week.',
        type: 'announcement',
        createdAt: '2025-01-19T14:00:00Z',
        priority: 'low'
      }
    ]
  });

  const { data: academicProgress = [] } = useQuery({
    queryKey: ['/api/parent/academics', selectedChild],
    queryFn: async () => [
      {
        subject: 'Mathematics',
        grade: 'A-',
        progress: 88,
        teacher: 'Ms. Rodriguez',
        lastAssignment: 'Fractions Quiz',
        lastGrade: 'A',
        trend: 'up'
      },
      {
        subject: 'English',
        grade: 'B+',
        progress: 85,
        teacher: 'Mr. Wilson',
        lastAssignment: 'Book Report',
        lastGrade: 'B+',
        trend: 'stable'
      },
      {
        subject: 'Science',
        grade: 'A',
        progress: 92,
        teacher: 'Dr. Chen',
        lastAssignment: 'Lab Experiment',
        lastGrade: 'A',
        trend: 'up'
      }
    ]
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['/api/parent/achievements', selectedChild],
    queryFn: async () => [
      {
        id: 1,
        title: 'Math Competition Winner',
        description: 'First place in the district math competition',
        date: '2025-01-15',
        type: 'academic',
        certificate: true
      },
      {
        id: 2,
        title: 'Perfect Attendance',
        description: 'No absences in the first semester',
        date: '2025-01-10',
        type: 'attendance',
        certificate: false
      }
    ]
  });

  const currentChild = children.find((child: any) => child.id === selectedChild) || children[0];

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const trendIcons = {
    up: '📈',
    down: '📉',
    stable: '➡️'
  };

  return (
    <div className="space-y-6">
      {/* Header with Child Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Portal</h1>
          <p className="text-gray-600">Stay connected with your child's education</p>
        </div>
        
        {children.length > 1 && (
          <div className="flex space-x-2">
            {children.map((child: any) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                onClick={() => setSelectedChild(child.id)}
                className="flex items-center space-x-2"
              >
                <Avatar className="w-6 h-6">
                  <AvatarImage src={child.avatar} />
                  <AvatarFallback>{child.firstName[0]}{child.lastName[0]}</AvatarFallback>
                </Avatar>
                <span>{child.firstName}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Student Info Card */}
      {currentChild && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={currentChild.avatar} />
                <AvatarFallback className="text-lg">
                  {currentChild.firstName[0]}{currentChild.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {currentChild.firstName} {currentChild.lastName}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>{currentChild.grade}</span>
                  <span>•</span>
                  <span>Class {currentChild.class}</span>
                  <span>•</span>
                  <span>Teacher: {currentChild.teacher}</span>
                  <span>•</span>
                  <span>{currentChild.branch}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="communication">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.slice(0, 3).map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(event.date), 'MMM d')} at {event.time}</span>
                        <MapPin className="w-3 h-3 ml-2" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Badge variant={event.rsvpStatus === 'confirmed' ? 'default' : 'secondary'}>
                      {event.rsvpStatus}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Recent Announcements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentAnnouncements.slice(0, 3).map((announcement: any) => (
                  <div key={announcement.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{announcement.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${priorityColors[announcement.priority]}`}
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{announcement.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academics" className="space-y-6">
          <div className="grid gap-6">
            {academicProgress.map((subject: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>{subject.subject}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary-700">{subject.grade}</span>
                      <span className="text-lg">{trendIcons[subject.trend]}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{subject.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Teacher:</span>
                        <p className="font-medium">{subject.teacher}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Assignment:</span>
                        <p className="font-medium">{subject.lastAssignment}</p>
                        <Badge variant="outline" className="text-xs mt-1">{subject.lastGrade}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-4">
            {upcomingEvents.map((event: any) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')} at {event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="mt-2">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Badge variant={event.rsvpStatus === 'confirmed' ? 'default' : 'secondary'}>
                        RSVP: {event.rsvpStatus}
                      </Badge>
                      {event.rsvpRequired && event.rsvpStatus === 'pending' && (
                        <Button size="sm" className="w-full">
                          Respond to RSVP
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-4">
            {achievements.map((achievement: any) => (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(achievement.date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{achievement.type}</Badge>
                      {achievement.certificate && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Teacher Communication</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Secure messaging system coming soon!</p>
                <p className="text-sm mt-2">You'll be able to communicate directly with teachers and staff.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}