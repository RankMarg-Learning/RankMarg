"use client"
import { BrainCircuit, ChartBarIcon, GraduationCap, ListChecks, RotateCcw, Target, XCircle, BookOpen, Award, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { 
    icon: BookOpen, 
    label: "Start Studying", 
    description: "Begin your daily session",
    href: "/ai-practice", 
    color: "blue",
    priority: 1,
    comingSoon: false
  },
  { 
    icon: BrainCircuit, 
    label: "AI Tutor", 
    description: "Get personalized help",
    href: "/ai-practice", 
    color: "purple",
    priority: 8,
    comingSoon: true
  },
  { 
    icon: ListChecks, 
    label: "By Subject", 
    description: "Practice specific topics",
    href: "/practice", 
    color: "amber",
    priority: 4,
    comingSoon: true
  },
  { 
    icon: XCircle, 
    label: "Fix Mistakes", 
    description: "Review & correct errors",
    href: "/mistakes-tracker", 
    color: "red",
    priority: 4,
    comingSoon: false
  },
  { 
    icon: ChartBarIcon, 
    label: "My Progress", 
    description: "Track performance",
    href: "/analytics", 
    color: "green",
    priority: 3,
    comingSoon: false
  },
  { 
    icon: RotateCcw, 
    label: "Review", 
    description: "Spaced repetition",
    href: "/review", 
    color: "cyan",
    priority: 6,
    comingSoon: true
  },
  { 
    icon: Target, 
    label: "Goals", 
    description: "Set & track targets",
    href: "/goals", 
    color: "indigo",
    priority: 7,
    comingSoon: true
  },
  { 
    icon: GraduationCap, 
    label: "Mastery", 
    description: "Subject proficiency",
    href: "/mastery", 
    color: "amber",
    priority: 2,
    comingSoon: false
  },
  { 
    icon: History, 
    label: "History", 
    description: "Past practice sessions",
    href: "/history", 
    color: "gray",
    priority: 9,
    comingSoon: true
  },
  { 
    icon: Award, 
    label: "Achievements", 
    description: "Badges & rewards",
    href: "/achievements", 
    color: "green",
    priority: 10,
    comingSoon: true
  }
];

export function QuickNavigation() {
  const isMobile = useIsMobile();
  
  const displayItems = isMobile 
    ? navItems.sort((a, b) => a.priority - b.priority).slice(0, 8) 
    : navItems.sort((a, b) => a.priority - b.priority).slice(0, 8);
  
  return (
    <section className="dashboard-section" aria-label="Quick Navigation">
      <h2 className="section-title mb-4">Quick Access</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {displayItems.map((item, index) => (
          <div className="aspect-square" key={index}>
            <QuickNavItem 
              icon={item.icon}
              label={item.label}
              description={item.description}
              href={item.href}
              color={item.color as ColorType}
              comingSoon={item.comingSoon}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

type ColorType = "blue" | "green" | "red" | "amber" | "purple" | "indigo" | "cyan" | "gray";

interface QuickNavItemProps {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  color: ColorType;
  comingSoon?: boolean;
}

function QuickNavItem({ icon: Icon, label, description, href, color, comingSoon }: QuickNavItemProps) {
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);

  const colorStyles = {
    blue: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100 hover:bg-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100",
    gray: "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
  };

  return (
    <div 
      className="relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={comingSoon ? "#" : href}
        className={cn(
          "flex flex-col items-center justify-center p-3 rounded-lg border transition-all h-full w-full",
          colorStyles[color],
          comingSoon ? "cursor-not-allowed opacity-70" : "hover:-translate-y-1 hover:shadow-sm",
          "text-center"
        )}
        onClick={(e) => comingSoon && e.preventDefault()}
        aria-disabled={comingSoon}
      >
        <Icon className="h-6 w-6 mb-2" />
        <span className="font-medium text-sm">{label}</span>
        {!isMobile && (
          <span className="text-xs opacity-80 mt-1">{description}</span>
        )}
      </Link>

      {comingSoon && (
        <div 
          className={cn(
            "absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="bg-white px-2 py-1 rounded shadow-sm text-center">
            <span className="text-xs font-semibold text-gray-600">Coming Soon</span>
          </div>
        </div>
      )}
    </div>
  );
}