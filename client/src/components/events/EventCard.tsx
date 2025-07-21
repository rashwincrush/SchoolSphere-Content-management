import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { Event } from '@shared/schema';
import { useLanguage } from '@/context/LanguageContext';

interface EventCardProps {
  event: Event & { 
    branch?: { name: string }; 
    _count?: { rsvps: number };
  };
  onEdit?: (event: Event) => void;
}

const categoryColors = {
  academic: 'bg-primary-100 text-primary-700',
  sports: 'bg-secondary-100 text-secondary-700',
  cultural: 'bg-warning-100 text-warning-700',
  other: 'bg-gray-100 text-gray-700',
};

const categoryIcons = {
  academic: '🎓',
  sports: '🏀',
  cultural: '🎭',
  other: '📅',
};

export function EventCard({ event, onEdit }: EventCardProps) {
  const { t } = useLanguage();

  const categoryColor = categoryColors[event.category as keyof typeof categoryColors] || categoryColors.other;
  const categoryIcon = categoryIcons[event.category as keyof typeof categoryIcons] || categoryIcons.other;

  return (
    <Card className="hover:bg-gray-50 transition-colors shadow-material-1">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${categoryColor}`}>
              <span className="text-lg">{categoryIcon}</span>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {format(new Date(event.startDate), 'MMM dd, yyyy')}
                  {event.startTime && ` at ${event.startTime}`}
                </span>
              </div>
              
              {event.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{event.location}</span>
                </div>
              )}
              
              {event._count?.rsvps && (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{event._count.rsvps} attending</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className={categoryColor}>
                  {t(event.category || 'other')}
                </Badge>
                
                {event.branch && (
                  <Badge variant="outline">
                    {event.branch.name}
                  </Badge>
                )}
              </div>
              
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(event)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
