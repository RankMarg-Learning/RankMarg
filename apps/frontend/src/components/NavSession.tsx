import React, { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
import Image from "next/image";
import { CircleUser } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { signOut, useSession, getSession } from "next-auth/react";

const NavSession = () => {
  const { data: session, status } = useSession();
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Automatically refresh session on initial load
  useEffect(() => {
    const refreshSession = async () => {
      const newSession = await getSession(); // Fetch the updated session
      setUserSession(newSession);
      setIsLoading(false);
    };

    if (status === "authenticated") {
      setUserSession(session);
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      refreshSession();
    }
  }, [status, session]);

  // Show nothing while loading
  if (isLoading) return null;

  return (
    <nav className="flex items-center justify-between">
      {userSession ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              {userSession.user?.image ? (
                <Image
                  src={userSession.user.image}
                  alt="User profile"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <CircleUser className="h-7 w-7" />
              )}
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>
              <Link href={`/u/${userSession.user?.username}`}>
                {userSession.user?.name || "User"}
              </Link>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex gap-1 md:gap-2">
          <Link href="/sign-in">
            <Button>Login</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Register</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default NavSession;
