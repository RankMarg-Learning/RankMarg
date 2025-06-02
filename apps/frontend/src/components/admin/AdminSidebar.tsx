"use client"
import { cn } from "@/lib/utils";
import { BookText, Brain,  LayoutDashboard, LineChart, LogOut, PenTool, Settings, TestTube, BookOpen, ArrowRightToLine, ArrowLeftFromLine } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, href, isActive, onClick }) => {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors ",
        isActive 
          ? "bg-primary  text-gray-800" 
          : "text-gray-600 hover:bg-primary-100"
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
};

const AdminSidebar = () => {
  const currentPath = usePathname()
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Brain, label: "Questions", href: "/admin/questions" },
    { icon: TestTube, label: "Tests", href: "/admin/tests" },
    { icon: BookOpen, label: "Curriculum", href: "/admin/curriculum" },
    { icon: BookText, label: "Blog", href: "/admin/blog" },
    { icon: LineChart, label: "Analytics", href: "/admin/analytics" },
    { icon: PenTool, label: "Content", href: "/admin/content" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className={cn(
      "bg-white  border-r border-gray-200 transition-all duration-300 flex flex-col",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-edu-blue text-primary-500 p-1 rounded">
              <Brain className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl text-primary-500">RankAdmin</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto bg-edu-blue text-primary-800 p-1 rounded">
            <Brain className="h-5 w-5" />
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700 "
        >
          {collapsed ? <ArrowRightToLine  className="w-4 h-4"/> : <ArrowLeftFromLine className="w-4 h-4"/>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={collapsed ? "" : item.label}
            href={item.href}
            isActive={currentPath == item.href}
            onClick={() => {}}
          />
        ))}
      </div>

      <div className="p-3 border-t border-gray-200">
        <Button 
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
