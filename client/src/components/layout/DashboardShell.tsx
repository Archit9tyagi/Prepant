import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Video,
  Users,
  Wallet,
  User,
  Star,
  MessageSquare,
  Heart,
  CreditCard,
  Settings,
  ShieldCheck,
  BookOpen,
  FileText,
  Mail,
  Sliders,
  History,
  Bell,
} from 'lucide-react';
import { Header } from './Header.js';
import type { Role } from '../../types/index.js';
import { cn } from '../../lib/utils.js';

interface DashboardShellProps {
  role: Role;
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ role, children }) => {
  const location = useLocation();

  const studentNav: NavItem[] = [
    { label: 'Overview', href: '/app', icon: LayoutDashboard },
    { label: 'My Sessions', href: '/app/sessions', icon: Video },
    { label: 'Messages', href: '/app/messages', icon: MessageSquare },
    { label: 'Favorites', href: '/app/favorites', icon: Heart },
    { label: 'Payments', href: '/app/payments', icon: CreditCard },
    { label: 'Settings', href: '/app/settings', icon: Settings },
    { label: 'Notifications', href: '/app/notifications', icon: Bell },
  ];

  const mentorNav: NavItem[] = [
    { label: 'Dashboard', href: '/teach', icon: LayoutDashboard },
    { label: 'Calendar', href: '/teach/calendar', icon: Calendar },
    { label: 'Availability', href: '/teach/availability', icon: Clock },
    { label: 'Sessions', href: '/teach/sessions', icon: Video },
    { label: 'Students', href: '/teach/students', icon: Users },
    { label: 'Earnings', href: '/teach/earnings', icon: Wallet },
    { label: 'Profile', href: '/teach/onboarding', icon: User },
    { label: 'Reviews', href: '/teach/reviews', icon: Star },
    { label: 'Messages', href: '/teach/messages', icon: MessageSquare },
    { label: 'Notifications', href: '/teach/notifications', icon: Bell },
  ];

  const adminNav: NavItem[] = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Mentor Queue', href: '/admin/mentors', icon: ShieldCheck },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Bookings', href: '/admin/bookings', icon: Video },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    { label: 'Payouts', href: '/admin/payouts', icon: Wallet },
    { label: 'Catalog', href: '/admin/catalog', icon: BookOpen },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Leads', href: '/admin/leads', icon: Mail },
    { label: 'Blog CMS', href: '/admin/blog', icon: FileText },
    { label: 'Settings', href: '/admin/settings', icon: Sliders },
    { label: 'Audit Log', href: '/admin/audit', icon: History },
  ];

  const items = role === 'mentor' ? mentorNav : role === 'admin' ? adminNav : studentNav;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 px-4 sm:px-6 lg:px-8 py-6 gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 rounded-[16px] border border-slate-200 bg-white p-3 shadow-xs">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              {role === 'mentor'
                ? 'Teacher Portal'
                : role === 'admin'
                  ? 'Admin Portal'
                  : 'Student Portal'}
            </div>
            <nav className="mt-2 space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/app' &&
                    item.href !== '/teach' &&
                    item.href !== '/admin' &&
                    location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-[10px] px-3 py-2 text-xs font-semibold transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <Icon
                      className={cn('h-4 w-4', isActive ? 'text-primary-600' : 'text-slate-400')}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
