"use client"

import * as React from "react"
import {
    BookOpen,
    LayoutDashboard,
    PieChart,
    GraduationCap,
    X,
    ClipboardList,
    UserPen,
    ExternalLink,
    ChevronsUpDown,
    LogOut,
    User,
    Settings
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarRail,
    SidebarTrigger,
    DropdownMenu,
    DropdownMenuTrigger,
    Avatar,
    AvatarImage,
    AvatarFallback,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuItem,
} from "@repo/common-ui"
import { Button } from "@repo/common-ui"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUserData } from "@/context/ClientContextProvider"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import api from "@/utils/api"

interface NavItem {
    icon: React.ElementType
    label: string
    href: string
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { user } = useUserData()
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

    const navItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: BookOpen, label: 'Mock Test', href: '/tests' },
        { icon: GraduationCap, label: 'Mastery', href: '/mastery' },
        { icon: X, label: 'Mistakes Tracker', href: '/mistakes-tracker' },
        { icon: PieChart, label: 'Analytics', href: '/analytics' },
        { icon: ClipboardList, label: 'My Curriculum', href: '/my-curriculum' },
        { icon: UserPen, label: 'Profile', href: `/u/${user?.username}` },
    ]

    return (
        <Sidebar collapsible="icon" className="bg-white border-r" {...props}>
            <SidebarHeader>
                <div className="flex items-center justify-between gap-2 px-2 py-1">
                    {/* Full logo - shown when expanded */}
                    <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                        <Image
                            src="https://cdn.rankmarg.in/assets/logo.png"
                            alt="RankMarg"
                            priority
                            width={80}
                            height={22}
                            className="object-contain sm:w-[90px] sm:h-[25px] md:w-[100px] md:h-[28px]"
                        />
                    </div>
                    <SidebarTrigger />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1.5 ">
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname.startsWith(item.href)}
                                        tooltip={item.label}
                                        className={cn(
                                            "h-auto gap-3 py-3 px-3 text-sm font-medium rounded-lg transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10",
                                            pathname.startsWith(item.href)
                                                ? "bg-primary-50 text-primary-900 shadow-sm border border-primary-100 hover:bg-primary-50 hover:text-primary-800 font-semibold"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        <Link href={item.href} className="flex items-center gap-3.5">
                                            <item.icon className="shrink-0 size-5 group-data-[collapsible=icon]:size-4" />
                                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {user && user.plan?.status !== 'ACTIVE' && (
                    <div className="p-2 group-data-[collapsible=icon]:hidden">
                        <div className="bg-primary-50 border border-primary-200 rounded-xl shadow-sm p-4 flex flex-col items-center">
                            <div className="flex flex-col items-center mb-2">
                                <div className="text-center">
                                    <div className="font-semibold text-sm text-primary-900">
                                        Get Unlimited Access
                                        <br />
                                        with <span className="font-bold">RANK Plan</span>
                                    </div>
                                    <div className="w-16 h-1 border-b-2 border-primary-400 mx-auto mt-1 mb-2 rounded-full" />
                                </div>
                            </div>
                            <Link
                                href={`/pricing?ref=side_upgrade&id=${user?.id}&current_plan=${user?.plan?.status}`}
                                target='_blank'
                                className="w-full"
                            >
                                <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-md mt-1" size="sm">
                                    View Benefits
                                    <ExternalLink className="ml-1 h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user?.avatar} alt={user?.name} />
                                        <AvatarFallback className="rounded-lg">{user?.name?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-medium">{user?.name}</span>
                                        <span className="truncate text-xs">{user?.email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side={'right'}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user?.avatar} alt={user?.name} />
                                            <AvatarFallback className="rounded-lg">
                                                {user?.name?.split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">{user?.name}</span>
                                            <span className="truncate text-xs">{user?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="hover:bg-gray-50">
                                        <Link href={`/u/${user?.name}`} className="flex items-center  text-sm rounded-md  cursor-pointer">
                                            <User className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="hover:bg-gray-50">
                                        <Link href="/settings" className="flex items-center  text-sm rounded-md  cursor-pointer">
                                            <Settings className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
