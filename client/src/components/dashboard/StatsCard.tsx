import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  iconBgColor?: string;
  changeColor?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  iconBgColor = 'bg-primary-50',
  changeColor = 'text-success-700',
}: StatsCardProps) {
  return (
    <Card className="shadow-material-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <p className={cn('text-sm mt-1', changeColor)}>
                {change}
              </p>
            )}
          </div>
          <div className={cn('p-3 rounded-full', iconBgColor)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
