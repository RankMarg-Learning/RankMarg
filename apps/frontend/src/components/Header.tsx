import { Crown, LogOut, Menu,  Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import Image from 'next/image';
import { useUserData } from '@/context/ClientContextProvider';
import api from '@/utils/api';
import { Skeleton } from './ui/skeleton';
import { useRouter } from 'next/navigation';
import HeaderTrialBadge from './upgrade/trial';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, isLoading } = useUserData();

  const router = useRouter()
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

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/95 border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto md:px-4 px-2sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section - Logo & Mobile Menu */}
          <div className="flex items-center md:gap-4 gap-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden h-10 w-10 hover:bg-gray-100"
            >
              <Menu size={20} />
            </Button>

            <Link href="/" className="flex items-center">
              <Image
                src="https://utfs.io/f/DbhgrrAIqRoKxS7q7dwj2eQpG3tSwkDuqa6AKMTcLIFsWXfn"
                alt="RankMarg Logo"
                width={100}
                height={28}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Right Section - Trial Badge, Upgrade & User Menu */}
          <div className="flex items-center md:gap-3 gap-1">
            {/* Trial Badge */}
            <HeaderTrialBadge 
              endDate={user?.plan?.endAt} 
              status={user?.plan?.status} 
              isLoading={isLoading}
              onUpgrade={() => window.location.href = `/pricing?ref=header_upgrade&id=${user?.id}&current_plan=${user?.plan?.status}`}
            />

            {/* Upgrade Button */}
            {user?.plan?.status !== "ACTIVE" && !isLoading && (
               <Link href={`/pricing?ref=header_upgrade&id=${user?.id}&current_plan=${user?.plan?.status}`} className=" flex items-center">
               <Button
                 variant="outline"
                 size="sm"
                 className="relative bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-300  transition-all duration-300 transform  font-semibold"
               >
                 <span className="relative z-10 flex items-center gap-1">
                   <Crown size={12} className="text-amber-600" />
                   Upgrade
                 </span>
                 <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-yellow-200/20 rounded-md animate-pulse"></div>
               </Button>
             </Link>
            )}

            {/* User Profile */}
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-20 hidden sm:block" />
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="flex items-center gap-3 h-auto p-2  rounded-lg transition-colors border-0 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9 ">
                        <AvatarImage src={user?.image} />
                        <AvatarFallback className="font-semibold">
                          {user?.name?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user?.plan?.status === "ACTIVE" && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                          <Crown size={8} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.plan?.status === "ACTIVE" ? "Premium" : "Free"}
                      </div>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.image} />
                        <AvatarFallback className="font-semibold">
                          {user?.name?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{user?.name}</div>
                        <div className="text-xs text-gray-500 md:hidden block">
                        {user?.plan?.status === "ACTIVE" ? "Premium" : "Free"}
                        </div>
                        <div className="text-xs text-gray-500 hidden md:block">
                        {user?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <DropdownMenuItem asChild>
                      <Link href={`/u/${user?.name}`} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-50 cursor-pointer">
                        <User className="mr-3 h-4 w-4 text-gray-400" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-50 cursor-pointer">
                        <Settings className="mr-3 h-4 w-4 text-gray-400" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-1">
                    <DropdownMenuItem
                      className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}