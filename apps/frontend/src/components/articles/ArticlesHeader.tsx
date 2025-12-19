"use client";

import { Crown, LogOut, Settings, User, BookOpen, Home } from 'lucide-react';
import { Button } from '@repo/common-ui';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/common-ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@repo/common-ui';
import Link from 'next/link';
import Image from 'next/image';
import { useUserData } from '@/context/ClientContextProvider';
import api from '@/utils/api';
import { Skeleton } from '@repo/common-ui';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import HeaderTrialBadge from '../upgrade/trial';
import { cn } from '@/lib/utils';

export function ArticlesHeader() {
  const { user, isLoading } = useUserData();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      const res = await api.post("/auth/sign-out");
      if (res.data.success) {
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/articles", label: "Articles", icon: BookOpen },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Left Section - Logo & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="https://cdn.rankmarg.in/assets/logo.png"
                alt="RankMarg Logo"
                priority
                width={80}
                height={22}
                className="object-contain sm:w-[90px] sm:h-[25px] md:w-[100px] md:h-[28px]"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section - Trial Badge, Notifications, Upgrade & User Menu */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            {/* Trial Badge */}
            <HeaderTrialBadge 
              endDate={user?.plan?.endAt} 
              status={user?.plan?.status} 
              isLoading={isLoading}
              onUpgrade={() => window.location.href = `/pricing?ref=header_upgrade&id=${user?.id}&current_plan=${user?.plan?.status}`}
            />

            

            {/* User Profile */}
            {isLoading ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
                <Skeleton className="h-3 w-16 sm:h-4 sm:w-20 hidden sm:block" />
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="flex items-center gap-1 sm:gap-2 md:gap-3 h-auto p-1 sm:p-2 rounded-lg transition-colors border-0 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="relative">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="font-semibold text-xs sm:text-sm">
                          {user?.name?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user?.plan?.status === "ACTIVE" && (
                        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                          <Crown size={6} className="text-white sm:w-2 sm:h-2" />
                        </div>
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-none">
                        {user?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.plan?.status === "ACTIVE" ? "Premium" : "Free"}
                      </div>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 sm:w-64 p-2">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="font-semibold text-sm">
                          {user?.name?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{user?.name}</div>
                        <div className="text-xs text-gray-500 sm:hidden">
                          {user?.plan?.status === "ACTIVE" ? "Premium" : "Free"}
                        </div>
                        <div className="text-xs text-gray-500 hidden sm:block truncate">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <DropdownMenuItem asChild>
                      <Link href={`/u/${user?.name}`} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-50 cursor-pointer">
                        <User className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-50 cursor-pointer">
                        <Settings className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-1">
                    <DropdownMenuItem
                      className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Sign Out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 sm:px-6 h-8 sm:h-9 text-xs sm:text-sm font-semibold"
                >
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
