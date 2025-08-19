import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { useLanguage } from '@/context/LanguageContext';
import { useBranch } from '@/context/BranchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { buildUrl } from '@/lib/queryClient';

export default function Calendar() {
  const { t } = useLanguage();
  const { selectedBranchId } = useBranch();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events', selectedBranchId],
    queryFn: async () => {
      const url = selectedBranchId ? `/api/events/${selectedBranchId}` : '/api/events/';
      const response = await fetch(buildUrl(url), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return Array.isArray(events) ? events.filter((event: any) => 
      isSameDay(parseISO(event.startDate), day)
    ) : [];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p>Loading calendar...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-roboto-slab font-bold text-gray-900 mb-2">
              {t('calendar')}
            </h1>
            <p className="text-gray-600">
              View events across all branches in calendar format
            </p>
          </div>
          
          <Button className="bg-primary-700 text-white hover:bg-primary-800">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Calendar Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <CardTitle className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {calendarDays.map(day => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-24 p-2 border border-gray-100 ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isToday ? 'bg-primary-50 border-primary-200' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday ? 'text-primary-700' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event: any) => (
                        <Badge
                          key={event.id}
                          variant="secondary"
                          className="text-xs p-1 w-full justify-start truncate"
                        >
                          {event.title}
                        </Badge>
                      ))}
                      
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Sidebar */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          <div className="grid gap-4">
            {Array.isArray(events) && events
              .filter((event: any) => new Date(event.startDate) >= new Date())
              .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 5)
              .map((event: any) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(event.startDate), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <Badge variant={event.category === 'academic' ? 'default' : 'secondary'}>
                        {event.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
