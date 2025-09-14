import { Bell, Crown, LogOut, Menu, Search, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { useUser } from '@/hooks/useUser';
import api from '@/utils/api';
import { Skeleton } from './ui/skeleton';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, isLoading } = useUser();
  const router = useRouter()
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
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-white/80 border-b border-card-border">
        <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="m-2 ml-2 lg:hidden"
          >
            <Menu size={28} />
          </Button>

          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://utfs.io/f/DbhgrrAIqRoKWCwFFv4kujRo2cBDzhfSAtQ1p0ZrLwxy9lHG"
                alt="Acme Inc"
                width={120}
                height={40}
                className="object-contain"
              />
            </Link>
          </div>
        </div>

        <div className="hidden  items-center bg-subtle-gray rounded-lg px-3 max-w-xs w-full">
          <Search size={18} className="text-muted-foreground mr-2" />
          <Input
            type="search"
            placeholder="Search..."
            className="border-0 bg-transparent shadow-none h-9 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden">
            <Search size={20} />
          </Button>

          <Button variant="ghost" size="icon" className=" hidden">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-accent rounded-full"></span>
          </Button>
          {
            
            user?.plan?.status !== "ACTIVE" && (
              <Link href={`/pricing?ref=header_upgrade&id=${user?.id}&current_plan=${user?.plan?.status}`} className="md:hidden flex items-center">
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
            )
          }

          {
            isLoading ? (
              <Skeleton className="w-8 h-8 rounded-full mr-3 gap-2" />
            ) : (
              
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer mr-3">
                <div className="relative">
                  <Avatar className="h-8 w-8 border border-card-border">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="bg-subtle-gray text-foreground">
                      {user?.username?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user?.plan?.status === "ACTIVE" && (
                    <Badge variant="outline" className="absolute -top-2 -right-2 bg-amber-50 text-amber-700 border-amber-200 p-0.5 gap-0.5 flex">
                      <Crown size={8} className="text-amber-500" />
                    </Badge>
                  )}
                </div>
                <span className="font-medium text-sm hidden md:inline-block">
                  {user?.username}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/u/${user?.username}`} className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center cursor-pointer text-red-500 focus:text-red-500"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
            )}
        </div>
      </div>
    </header>
    </>
  );
}