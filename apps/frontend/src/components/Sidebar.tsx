import React, { useState } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  PieChart,
  BrainCircuit,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  UserPen,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@repo/common-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserData } from '@/context/ClientContextProvider';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = usePathname();
  const { user } = useUserData();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: BrainCircuit, label: 'Smart Practice', href: '/ai-practice' },
    { icon: BookOpen, label: 'Mock Test', href: '/tests' },
    { icon: GraduationCap, label: 'Mastery', href: '/mastery' },
    { icon: X, label: 'Mistakes Tracker', href: '/mistakes-tracker' },
    { icon: PieChart, label: 'Analytics', href: '/analytics' },
    { icon: ClipboardList, label: 'My Curriculum', href: '/my-curriculum' },
    { icon: UserPen, label: 'Profile', href: `/u/${user?.username}` },
  ];

  return (
    <aside
      className={cn(
        "bg-white border-r border-card-border h-[calc(100vh-64px)] sticky top-16 transition-all duration-300",
        collapsed ? "w-16a" : "w-[240px]",
        className
      )}
    >
      {/* Collapse button - hidden on mobile */}
      <div className="p-2 justify-end hidden lg:flex">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </Button>
      </div>

      <nav className="px-2 py-2">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors",
                  location.startsWith(item.href)
                    ? "bg-primary-50 text-primary-600 border border-primary-200"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon size={18} />
                <span className={cn(
                  "lg:block",
                  collapsed && "lg:hidden"
                )}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Upgrade Card at the bottom */}
      {user && user.plan?.status !== 'ACTIVE' && !collapsed && (
        <div className="absolute bottom-4 left-0 w-full flex  justify-center px-1">
          <div className="bg-primary-50 border border-primary-200 rounded-xl shadow-sm p-4 flex flex-col items-center w-full max-w-[220px]">
            <div className="flex flex-col items-center mb-2">

              <div className="text-center">
                <div className="font-semibold text-base text-primary-900">Get Unlimited Access<br />with <span className="font-bold">RANK Plan</span></div>
                <div className="w-16 h-1 border-b-2 border-primary-400 mx-auto mt-1 mb-2 rounded-full" />
              </div>
            </div>
            <Link href={`/pricing?ref=side_upgrade&id=${user?.id}&current_plan=${user?.plan?.status}`} target='_blank' className="w-full">
              <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-md mt-1" size="sm">
                View Benefits
                <ExternalLink />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}