import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBranch } from '@/context/BranchContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import {
  Calendar,
  Share2,
  UserPlus,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

const iconMap = {
  event: Calendar,
  post: Share2,
  user: UserPlus,
  analytics: TrendingUp,
  notification: AlertTriangle,
};

const colorMap = {
  event: 'bg-primary-100 text-primary-700',
  post: 'bg-secondary-100 text-secondary-700',
  user: 'bg-warning-100 text-warning-700',
  analytics: 'bg-success-100 text-success-700',
  notification: 'bg-error-100 text-error-700',
};

export function ActivityFeed() {
  const { selectedBranchId } = useBranch();
  const { t } = useLanguage();

  const { data: activities = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/activity', selectedBranchId],
  });

  if (isLoading) {
    return (
      <Card className="shadow-material-1">
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-material-1">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>{t('recentActivity')}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="link" size="sm" className="text-primary-700">
              All Branches
            </Button>
            <Button variant="link" size="sm" className="text-gray-500">
              Current Branch
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No recent activity
            </p>
          ) : (
            activities.map((activity: any) => {
              const IconComponent = iconMap[activity.entityType as keyof typeof iconMap] || Calendar;
              const colorClass = colorMap[activity.entityType as keyof typeof colorMap] || colorMap.event;
              
              return (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user?.firstName || 'User'}</span>{' '}
                      <span>{activity.action}</span>{' '}
                      {activity.details?.eventTitle && (
                        <span className="font-medium text-primary-700">
                          "{activity.details.eventTitle}"
                        </span>
                      )}
                      {activity.details?.postTitle && (
                        <span className="font-medium text-secondary-700">
                          "{activity.details.postTitle}"
                        </span>
                      )}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                      {activity.branch && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.branch.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="link" className="text-primary-700">
              Load More Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
