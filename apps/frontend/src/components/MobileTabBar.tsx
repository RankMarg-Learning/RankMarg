'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    PieChart,
    ClipboardList,
} from 'lucide-react'

interface TabItem {
    icon: React.ElementType
    label: string
    href: string
}

const tabItems: TabItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: BookOpen, label: 'Mock Test', href: '/tests' },
    { icon: GraduationCap, label: 'Mastery', href: '/mastery' },
    { icon: PieChart, label: 'Analytics', href: '/analytics' },
    { icon: ClipboardList, label: 'Curriculum', href: '/my-curriculum' },
]

export function MobileTabBar() {
    const pathname = usePathname()

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                {tabItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                                isActive
                                    ? 'text-primary-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <Icon
                                size={20}
                                className={cn(
                                    'transition-all',
                                    isActive && 'scale-110'
                                )}
                            />
                            <span
                                className={cn(
                                    'text-[10px] font-medium transition-all',
                                    isActive && 'font-semibold'
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
