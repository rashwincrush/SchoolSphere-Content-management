import { useState } from 'react';
import { Bell, User as UserIcon } from 'lucide-react';
import { BranchSelector } from '@/components/common/BranchSelector';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import type { User, Notification } from '@shared/schema';

export function TopBar() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  return (
    <header className="bg-primary-700 text-white shadow-material-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <span className="text-2xl font-roboto-slab font-bold">EduConnect</span>
            </div>
            <BranchSelector />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 rounded-full hover:bg-primary-800 transition-colors text-white"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2">
              {(user as any)?.profileImageUrl ? (
                <img
                  src={(user as any).profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <span className="text-sm">
                {(user as any)?.firstName && (user as any)?.lastName
                  ? `${(user as any).firstName} ${(user as any).lastName}`
                  : (user as any)?.email || 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
}
