"use client"

import * as React from "react"
import {
    BookOpen,
    LayoutDashboard,
    PieChart,
    BrainCircuit,
    GraduationCap,
    X,
    ClipboardList,
    UserPen,
    ExternalLink
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
} from "@repo/common-ui"
import { Button } from "@repo/common-ui"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUserData } from "@/context/ClientContextProvider"
import { cn } from "@/lib/utils"

interface NavItem {
    icon: React.ElementType
    label: string
    href: string
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { user } = useUserData()

    const navItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: BrainCircuit, label: 'Smart Practice', href: '/ai-practice' },
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
                        <SidebarMenu className="space-y-0.5">
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname.startsWith(item.href)}
                                        tooltip={item.label}
                                        className={cn(
                                            "gap-3 py-2.5 px-3 text-sm font-medium transition-colors group-data-[collapsible=icon]:justify-center",
                                            pathname.startsWith(item.href)
                                                ? "bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-50 hover:text-primary-600"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                        )}
                                    >
                                        <Link href={item.href} className="flex items-center gap-3">
                                            <item.icon className="shrink-0" size={20} />
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
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
