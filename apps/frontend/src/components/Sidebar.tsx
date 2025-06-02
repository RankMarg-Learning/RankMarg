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
  ArrowUpNarrowWide,
  UserPen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface SidebarProps {
  mobileMenuOpen?: boolean;
  className?: string;
}

export function Sidebar({ className, mobileMenuOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = usePathname();
  const { data: session } = useSession();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: BrainCircuit, label: 'Smart Practice', href: '/ai-practice' },
    { icon: BookOpen, label: 'Mock Test', href: '/tests' },
    { icon: GraduationCap, label: 'Mastery', href: '/mastery' },
    { icon: X, label: 'Mistakes Tracker', href: '/mistakes-tracker' },
    { icon: PieChart, label: 'Analytics', href: '/analytics' },
    { icon: ArrowUpNarrowWide, label: 'Leaderboard', href: '/leaderboard' },
    { icon: UserPen, label: 'Profile', href: `/u/${session?.user?.username}` },
  ];

  return (
    <aside
      className={cn(
        "bg-white border-r border-card-border h-[calc(100vh-64px)] sticky top-16 transition-all duration-300",
        collapsed ? "w-28" : "w-60",
        "lg:w-auto w-56",
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
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location === item.href
                    ? "bg-gradient-to-tr from-primary-600 to-primary-500 text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon size={18} />
                {/* On desktop: show label when not collapsed, on mobile: always show */}
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
    </aside>
  );
}