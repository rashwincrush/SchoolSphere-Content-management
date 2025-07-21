import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  Mail,
  Bell,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

type RSVPStatus = 'attending' | 'not_attending' | 'maybe' | 'pending';

type Attendee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  status: RSVPStatus;
  respondedAt?: string;
  remindersSent: number;
  lastReminderSent?: string;
};

type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  maxAttendees?: number;
  requiresRsvp: boolean;
  rsvpDeadline?: string;
};

interface RSVPManagerProps {
  eventId: number;
}

export function RSVPManager({ eventId }: RSVPManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: event } = useQuery<Event>({
    queryKey: ['/api/events', eventId],
  });

  const { data: attendees = [] } = useQuery<Attendee[]>({
    queryKey: ['/api/events', eventId, 'attendees'],
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      return apiRequest('POST', `/api/events/${eventId}/send-reminders`, { userIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'attendees'] });
      toast({
        title: 'Reminders Sent',
        description: 'RSVP reminders have been sent successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send reminders. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const exportAttendeesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('GET', `/api/events/${eventId}/export-attendees`);
    },
    onSuccess: async (response) => {
      // Create and download CSV file
      const csvData = await response.text();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event?.title}-attendees.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const updateRSVPMutation = useMutation({
    mutationFn: async ({ attendeeId, status }: { attendeeId: string; status: RSVPStatus }) => {
      return apiRequest('PATCH', `/api/events/${eventId}/rsvp`, { attendeeId, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'attendees'] });
      toast({
        title: 'RSVP Updated',
        description: 'Attendee RSVP status has been updated.',
      });
    },
  });

  const stats = {
    total: attendees.length,
    attending: attendees.filter(a => a.status === 'attending').length,
    notAttending: attendees.filter(a => a.status === 'not_attending').length,
    maybe: attendees.filter(a => a.status === 'maybe').length,
    pending: attendees.filter(a => a.status === 'pending').length,
  };

  const responseRate = stats.total > 0 ? ((stats.total - stats.pending) / stats.total) * 100 : 0;
  const attendanceRate = stats.total > 0 ? (stats.attending / stats.total) * 100 : 0;

  const statusColors = {
    attending: 'bg-green-100 text-green-800',
    not_attending: 'bg-red-100 text-red-800',
    maybe: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-gray-100 text-gray-800',
  };

  const statusIcons = {
    attending: CheckCircle,
    not_attending: XCircle,
    maybe: AlertCircle,
    pending: Clock,
  };

  const pendingAttendees = attendees.filter(a => a.status === 'pending');
  const needsReminder = attendees.filter(a => 
    a.status === 'pending' && 
    (!a.lastReminderSent || 
     new Date().getTime() - new Date(a.lastReminderSent).getTime() > 48 * 60 * 60 * 1000)
  );

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">RSVP Management</h2>
          <p className="text-gray-600">{event.title}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => exportAttendeesMutation.mutate()}
            disabled={exportAttendeesMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
          {needsReminder.length > 0 && (
            <Button
              onClick={() => sendReminderMutation.mutate(needsReminder.map(a => a.id))}
              disabled={sendReminderMutation.isPending}
            >
              <Bell className="w-4 h-4 mr-2" />
              Send Reminders ({needsReminder.length})
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invited</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attending</p>
                <p className="text-2xl font-bold text-green-600">{stats.attending}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold">{Math.round(responseRate)}%</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-primary-600 rounded-full transition-all duration-300"
                    style={{ width: `${responseRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">RSVP Progress</h3>
              <span className="text-sm text-gray-600">
                {stats.total - stats.pending} of {stats.total} responded
              </span>
            </div>
            <Progress value={responseRate} className="h-2" />
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Attending ({stats.attending})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span>Not Attending ({stats.notAttending})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span>Maybe ({stats.maybe})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span>Pending ({stats.pending})</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendee Management */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">All Attendees</TabsTrigger>
          <TabsTrigger value="attending">Attending ({stats.attending})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="not_attending">Not Attending ({stats.notAttending})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AttendeeList 
            attendees={attendees} 
            onUpdateRSVP={(attendeeId, status) => updateRSVPMutation.mutate({ attendeeId, status })}
            onSendReminder={(attendeeId) => sendReminderMutation.mutate([attendeeId])}
          />
        </TabsContent>

        <TabsContent value="attending" className="space-y-4">
          <AttendeeList 
            attendees={attendees.filter(a => a.status === 'attending')} 
            onUpdateRSVP={(attendeeId, status) => updateRSVPMutation.mutate({ attendeeId, status })}
            onSendReminder={(attendeeId) => sendReminderMutation.mutate([attendeeId])}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <AttendeeList 
            attendees={attendees.filter(a => a.status === 'pending')} 
            onUpdateRSVP={(attendeeId, status) => updateRSVPMutation.mutate({ attendeeId, status })}
            onSendReminder={(attendeeId) => sendReminderMutation.mutate([attendeeId])}
          />
        </TabsContent>

        <TabsContent value="not_attending" className="space-y-4">
          <AttendeeList 
            attendees={attendees.filter(a => a.status === 'not_attending')} 
            onUpdateRSVP={(attendeeId, status) => updateRSVPMutation.mutate({ attendeeId, status })}
            onSendReminder={(attendeeId) => sendReminderMutation.mutate([attendeeId])}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AttendeeListProps {
  attendees: Attendee[];
  onUpdateRSVP: (attendeeId: string, status: RSVPStatus) => void;
  onSendReminder: (attendeeId: string) => void;
}

function AttendeeList({ attendees, onUpdateRSVP, onSendReminder }: AttendeeListProps) {
  const statusColors = {
    attending: 'bg-green-100 text-green-800',
    not_attending: 'bg-red-100 text-red-800',
    maybe: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-gray-100 text-gray-800',
  };

  if (attendees.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No attendees in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {attendees.map((attendee) => (
        <Card key={attendee.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={attendee.avatar} />
                  <AvatarFallback>
                    {attendee.firstName[0]}{attendee.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">
                    {attendee.firstName} {attendee.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{attendee.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {attendee.role}
                    </Badge>
                    <Badge className={`text-xs ${statusColors[attendee.status]}`}>
                      {attendee.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {attendee.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendReminder(attendee.id)}
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Remind
                  </Button>
                )}
                
                <div className="flex space-x-1">
                  <Button
                    variant={attendee.status === 'attending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateRSVP(attendee.id, 'attending')}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={attendee.status === 'maybe' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateRSVP(attendee.id, 'maybe')}
                  >
                    <AlertCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={attendee.status === 'not_attending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateRSVP(attendee.id, 'not_attending')}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {(attendee.respondedAt || attendee.lastReminderSent) && (
              <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                <div className="flex justify-between">
                  {attendee.respondedAt && (
                    <span>
                      Responded {formatDistanceToNow(new Date(attendee.respondedAt), { addSuffix: true })}
                    </span>
                  )}
                  {attendee.lastReminderSent && (
                    <span>
                      Last reminder sent {formatDistanceToNow(new Date(attendee.lastReminderSent), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}