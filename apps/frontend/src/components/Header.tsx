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
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import useSessionStore from '@/store/sessionStore';
import { Stream } from '@prisma/client';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const { setStream } = useSessionStore();

  useEffect(() => {
    if (session?.user?.stream) {
      setStream(session.user.stream as Stream);
    }
  }, [session?.user?.stream, setStream]);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-white/80 border-b border-card-border">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="mr-1 lg:hidden"
          >
            <Menu size={20} />
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

          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-accent rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer mr-3">
                <div className="relative">
                  <Avatar className="h-8 w-8 border border-card-border">
                    <AvatarImage src={session?.user.image} />
                    <AvatarFallback className="bg-subtle-gray text-foreground">
                      {session?.user.name?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {session?.user?.plan?.status === "ACTIVE" && (
                    <Badge variant="outline" className="absolute -top-2 -right-2 bg-amber-50 text-amber-700 border-amber-200 p-0.5 gap-0.5 flex">
                      <Crown size={8} className="text-amber-500" />
                    </Badge>
                  )}
                </div>
                <span className="font-medium text-sm hidden md:inline-block">
                  {session?.user?.name}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/u/${session?.user?.username}`} className="flex items-center cursor-pointer">
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
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}