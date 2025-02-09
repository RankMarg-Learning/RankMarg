"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { StreamSelector } from "./StreamSelector";
import { filterData } from "@/constant/topics";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect } from "react";
import NavSession from "./NavSession";

const Navbar = () => {
  const { data: session, status } = useSession();
  const currentStream = session?.user?.stream || "JEE";

  useEffect(() => {
    localStorage.setItem("username",session?.user?.username)
    localStorage.setItem("userId",session?.user?.id)
    localStorage.setItem("stream", currentStream)
  }, [currentStream, session])

  return (
    <header className="sticky z-50 top-0 flex w-full h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      {status === "authenticated" && <StreamSelector />}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden border-gray-300 hover:border-gray-500 transition duration-300"
          >
            <Menu className="h-5 w-5 text-gray-700" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="bg-white w-[200px] shadow-lg border-r border-gray-200 p-0"
        >
          <nav className="flex flex-col h-full">
            {/* Header with Logo */}
            <div className="p-4 border-b">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="https://utfs.io/f/DbhgrrAIqRoKWCwFFv4kujRo2cBDzhfSAtQ1p0ZrLwxy9lHG"
                  alt="Acme Inc"
                  width={150}
                  height={40}
                  className="object-contain"
                />
              </Link>
            </div>



            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                <Link
                  href="/"
                  className="flex items-center text-sm p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Home
                </Link>


                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="subjects" className="border-none">
                    <AccordionTrigger className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      Questions
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <div className="grid gap-2">
                        <Link
                          href={`/questionset`}
                          className="px-4 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors"
                        >
                          All Questions
                        </Link>
                        {Object.keys(filterData[currentStream]).map((subject) => (
                          <Link
                            key={subject}
                            href={`/questions/${subject}`}
                            className="px-4 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                          >
                            {subject}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tests" className="border-none">
                    <AccordionTrigger className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      Tests
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <div className="grid gap-2">
                        <Link
                          href="/tests"
                          className="px-4 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Mock Tests
                        </Link>
                        <Link
                          href="/tests/create"
                          className="px-4 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Subject-wise Tests
                        </Link>
                        <Link
                          href="/tests/topic-wise"
                          className="px-4 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Topic-wise Tests
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Link
                  href="/challenge"
                  className="hidden items-center text-sm p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Challenge
                </Link>
              </div>
            </div>

          </nav>
        </SheetContent>
      </Sheet>
      <Link
        href="/"
        className="hidden md:flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        <Image src={'https://utfs.io/f/DbhgrrAIqRoKWCwFFv4kujRo2cBDzhfSAtQ1p0ZrLwxy9lHG'} alt="Acme Inc" width={180} height={180} priority />
      </Link>
      <nav className="hidden  flex-col gap-8 text-lg font-medium md:flex md:flex-row md:items-center md:gap-8 md:text-sm lg:gap-10">


        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2">
                Home
              </Link>
            </NavigationMenuItem>


            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-muted-foreground transition-colors hover:text-foreground">
                Questions
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-2 p-4 w-[300px] md:w-[300px] lg:w-[300px] grid-cols-2">
                  <Link
                    href={`/questionset`}
                    className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    All Questions
                  </Link>
                  {Object.keys(filterData[currentStream]).map((subject) => (
                    <Link
                      key={subject}
                      href={`/questions/${subject.toLowerCase()}`}
                      className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      {subject}
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-muted-foreground transition-colors hover:text-foreground">
                Tests
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-2 p-4 w-[300px] md:w-[300px] lg:w-[300px]">
                  <Link
                    href="/tests"
                    className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    Mock Tests
                  </Link>
                  <Link
                    href="/tests/subject-wise"
                    className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    Subject-wise Tests
                  </Link>
                  <Link
                    href="/tests/topic-wise"
                    className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    Topic-wise Tests
                  </Link>

                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/challenge" className="hidden text-muted-foreground transition-colors hover:text-foreground  h-10 w-max items-center justify-center rounded-md px-4 py-2">
                Challenge
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>


      <div className="flex w-full items-center justify-end  md:ml-auto md:gap-2 lg:gap-4">
        <NavSession />
        {/* {
          status === "loading" ? null: status === "authenticated" ? (
             <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="secondary" size="icon" className="rounded-full">
                 {session?.user?.image ? (
                   <Image
                     src={session.user.image}
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
             <DropdownMenuContent >
               <DropdownMenuLabel><Link href={`/u/${session?.user?.username}`}>{session?.user?.name || "User"}</Link></DropdownMenuLabel>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                 Log Out
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
          ):(
            <div className="flex gap-1 md:gap-2">
            <Link href={"/sign-in"}>
              {" "}
              <Button>Login</Button>
            </Link>
            <Link href={"/sign-up"}>
              {" "}
              <Button>Register</Button>
            </Link>
          </div>)

        } */}



      </div>
    </header>
  );
};

export default Navbar;