import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { EventCard } from '@/components/events/EventCard';
import { EventForm } from '@/components/events/EventForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useBranch } from '@/context/BranchContext';
import type { Event } from '@shared/schema';
import { buildUrl } from '@/lib/queryClient';

export default function Events() {
  const { t } = useLanguage();
  const { selectedBranchId } = useBranch();
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events', selectedBranchId],
    queryFn: async () => {
      const url = selectedBranchId ? `/api/events?branchId=${selectedBranchId}` : '/api/events';
      const response = await fetch(buildUrl(url), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  // Filter events based on search and category
  const filteredEvents = Array.isArray(events) ? events.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) : [];

  // Separate upcoming and past events
  const upcomingEvents = filteredEvents.filter((event: any) => 
    new Date(event.startDate) >= new Date()
  ).sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const pastEvents = filteredEvents.filter((event: any) => 
    new Date(event.startDate) < new Date()
  ).sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleCloseForm = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p>{t('loading')}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-roboto-slab font-bold text-gray-900 mb-2">
              {t('events')}
            </h1>
            <p className="text-gray-600">
              Manage and organize events for your school
            </p>
          </div>
          
          <Button
            onClick={() => setShowEventForm(true)}
            className="bg-primary-700 text-white hover:bg-primary-800 shadow-material-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('createEvent')}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="academic">{t('academic')}</SelectItem>
              <SelectItem value="sports">{t('sports')}</SelectItem>
              <SelectItem value="cultural">{t('cultural')}</SelectItem>
              <SelectItem value="other">{t('other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {t('upcomingEvents')} ({upcomingEvents.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingEvents.map((event: any) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={handleEditEvent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Past Events ({pastEvents.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pastEvents.map((event: any) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={handleEditEvent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || categoryFilter !== 'all' ? 'No events found' : 'No events yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || categoryFilter !== 'all'
                ? 'Try adjusting your filters to find more events.'
                : 'Get started by creating your first event.'}
            </p>
            {!searchTerm && categoryFilter === 'all' && (
              <Button
                onClick={() => setShowEventForm(true)}
                className="bg-primary-700 text-white hover:bg-primary-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('createEvent')}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      <EventForm
        open={showEventForm}
        onOpenChange={handleCloseForm}
        event={selectedEvent}
      />
    </AppShell>
  );
}
