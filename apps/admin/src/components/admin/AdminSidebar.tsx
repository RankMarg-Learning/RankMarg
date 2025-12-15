"use client"
import { cn } from "@/lib/utils";
import { Brain,  LayoutDashboard,  LogOut,  TestTube, BookOpen, ArrowRightToLine, ArrowLeftFromLine, CreditCard, Gift, Upload, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Button } from "@repo/common-ui";
import api from "@/utils/api";
import { useUserData } from "@/context/ClientContextProvider";
import { Role } from "@repo/db/enums";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  onClick: () => void;
  exact?: boolean;
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
  const router = useRouter();
  const { user } = useUserData();
  
  const allMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", exact: true },
    { icon: Brain, label: "Questions", href: "/admin/questions" },
    { icon: Upload, label: "Bulk Upload", href: "/admin/bulk-upload" },
    { icon: TestTube, label: "Tests", href: "/admin/tests" },
    { icon: BookOpen, label: "Curriculum", href: "/admin/curriculum" },
    { icon: MessageSquare, label: "Question Reports", href: "/admin/reports" },
    { icon: CreditCard, label: "Plans", href: "/admin/plans" },
    { icon: Gift, label: "PromoCodes", href: "/admin/promocodes" },
    { icon: Users, label: "User Subscriptions", href: "/admin/user-subscriptions" },
    // { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  // Filter menu items based on user role
  // Plans, PromoCodes, and User Subscriptions are only for ADMIN, not INSTRUCTOR
  const menuItems = useMemo(() => {
    if (user?.role === Role.INSTRUCTOR) {
      return allMenuItems.filter(item => 
        item.href !== "/admin/plans" && 
        item.href !== "/admin/promocodes" && 
        item.href !== "/admin/user-subscriptions"
      );
    }
    return allMenuItems;
  }, [user?.role]);

  const handleSignOut = async() => {
    try {
      const res = await api.post("/auth/sign-out");
      if(res.data.success){
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
        {menuItems.map((item) => {
          const isActive = item.exact 
            ? currentPath === item.href 
            : currentPath === item.href || currentPath?.startsWith(item.href + "/")
          return (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={collapsed ? "" : item.label}
              href={item.href}
              isActive={isActive}
              onClick={() => {}}
            />
          )
        })}
      </div>

      <div className="p-3 border-t border-gray-200">
        <Button 
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
