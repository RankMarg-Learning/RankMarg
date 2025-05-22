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
  isMobile?: boolean;
  className?: string;
}

export function Sidebar({ className ,isMobile}: SidebarProps) {

  const [collapsed, setCollapsed] = useState(false);
  const location =  usePathname();
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
        "bg-white border-r border-card-border h-[calc(100vh-64px)] sticky top-16 transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-56",
        className
      )}
    >
      <div className={`p-2 flex justify-end ${isMobile ? 'hidden' : 'block'}`}>
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
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}