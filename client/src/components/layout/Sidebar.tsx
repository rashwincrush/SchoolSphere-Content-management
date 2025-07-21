import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Share2,
  CalendarDays,
  BarChart3,
  Users,
  Settings,
  User,
  Building,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'dashboard', href: '/', icon: LayoutDashboard },
  { name: 'events', href: '/events', icon: Calendar },
  { name: 'content', href: '/content', icon: FileText },
  { name: 'social', href: '/social', icon: Share2 },
  { name: 'calendar', href: '/calendar', icon: CalendarDays },
  { name: 'analytics', href: '/analytics', icon: BarChart3 },
  { name: 'users', href: '/users', icon: Users },
  { name: 'settings', href: '/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Branch Management', href: '/branch-management', icon: Building },
];

export function Sidebar() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();

  const isOwnerOrAdmin = ['owner', 'admin'].includes((user as any)?.role);

  return (
    <nav className="w-64 bg-surface border-r border-gray-200 shadow-material-1">
      <div className="p-4 space-y-2">
        {/* Main Navigation */}
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer',
                  isActive
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{t(item.name)}</span>
              </div>
            </Link>
          );
        })}

        {/* Admin Navigation */}
        {isOwnerOrAdmin && (
          <>
            <div className="py-2">
              <div className="border-t border-gray-200 pt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Administration
                </p>
              </div>
            </div>
            {adminNavigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer',
                      isActive
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </nav>
  );
}
