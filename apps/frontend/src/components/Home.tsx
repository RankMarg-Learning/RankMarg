'use client'

import { Avatar, AvatarFallback, AvatarImage, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Skeleton } from '@repo/common-ui'
import { BookOpen, Crown, User, Settings, LogOut } from 'lucide-react'
import { SubjectBackgroundColor, SubjectCardColor } from '@/constant/SubjectColorCode'
import { useUserData } from '@/context/ClientContextProvider'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import Link from 'next/link'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { useHome, useTodayStats } from '@/hooks/useHome'
import ErrorCTA from '@/components/error'
import SmartSubjectSession from './dashboard/SmartSubjectSession'



export const DashboardHome = () => {

    const { user } = useUserData();
    const { stats, isLoading, isError, error } = useTodayStats();
    const { session, } = useHome()

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

    if (isError) {
        return <ErrorCTA message={error?.message} />
    }

    return (
        <div className="min-h-screen ">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 text-gray-900">
                <div className="border-b border-gray-200 md:border-none">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                        <div className="flex items-center justify-between h-12 sm:h-14">

                            <div className="md:flex items-center gap-2 sm:gap-3 block hidden">
                                <h1 className="text-primary-900 sm:text-lg md:text-xl font-bold text-gray-900 mb-1">
                                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋
                                </h1>

                            </div>
                            {/* Left - Logo & Brand */}
                            <div className="flex items-center gap-3 block md:hidden">
                                {/* User Profile */}
                                {isLoading ? (
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
                                        <Skeleton className="h-3 w-16 sm:h-4 sm:w-20 hidden sm:block" />
                                    </div>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div
                                                className="flex items-center gap-1 sm:gap-2 md:gap-3 h-auto p-0.5 sm:p-1 md:p-2 rounded-lg transition-colors border-0 cursor-pointer hover:bg-gray-50"
                                            >
                                                <div className="relative">
                                                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
                                                        <AvatarImage src={user?.avatar} />
                                                        <AvatarFallback className="font-semibold text-[10px] sm:text-xs">
                                                            {user?.name?.split(" ")
                                                                .map((n) => n[0])
                                                                .join("")
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {user?.plan?.status === "ACTIVE" && (
                                                        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                                                            <Crown className="text-white w-1.5 h-1.5 sm:w-2 sm:h-2" />
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
                                                    <Avatar className="h-10 w-10 sm:h-10 sm:w-10">
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
                                )}
                            </div>



                            <div className="flex items-center gap-2 sm:gap-3">
                                {user?.plan?.status !== "ACTIVE" && !isLoading && (
                                    <Link href={`/pricing?ref=header_upgrade&id=${user?.id}&current_plan=${user?.plan?.status}`} className="flex items-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="relative bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-300 transition-all duration-300 transform font-semibold h-8 px-2 sm:h-9 sm:px-3"
                                        >
                                            <span className="relative z-10 flex items-center gap-1">
                                                <Crown size={10} className="text-amber-600 sm:w-3 sm:h-3" />
                                                <span className="text-xs sm:text-sm">Upgrade</span>
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-yellow-200/20 rounded-md animate-pulse"></div>
                                        </Button>
                                    </Link>
                                )}
                                {!isLoading && <NotificationDropdown />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Content */}
                <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-5 pb-3 sm:pb-4 pt-2">
                    {/* Greeting */}
                    <div className="mb-4 sm:mb-6 md:hidden">
                        <h1 className=" text-primary-900 sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-1">
                            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋
                        </h1>
                        <p className="text-gray-600 text-xs sm:text-sm">
                            Here's your progress for today
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3 sm:space-y-4">
                            <Skeleton className="h-28 sm:h-32 w-full bg-primary-50 rounded-xl" />
                        </div>
                    ) : stats ? (
                        <div className="space-y-3 sm:space-y-4 md:space-y-5">
                            {/* Main Stats Card */}
                            <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50 border border-primary-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                    <div className="w-full sm:w-auto">
                                        <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Questions Solved Today</p>
                                        <div className="flex items-baseline gap-2 sm:gap-3">
                                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
                                                {stats.totalQuestions}
                                            </h2>
                                            <span className="text-xl sm:text-2xl font-semibold text-primary-600">
                                                {Math.round(stats.accuracy)}%
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">
                                            Overall accuracy
                                        </p>
                                    </div>
                                    {/* Subject Badges */}
                                    {stats.subjectBreakdown && stats.subjectBreakdown.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
                                            {stats.subjectBreakdown.map((subject, index) => {
                                                const subjectKey = subject.subjectName.toLowerCase() as keyof typeof SubjectBackgroundColor
                                                const bgColor = SubjectCardColor[subjectKey] || SubjectCardColor.default

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`${bgColor} text-gray-600 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold whitespace-nowrap`}
                                                    >
                                                        {subject.subjectName} {Math.round(subject.accuracy)}%
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-6 sm:p-8 md:p-12 text-center shadow-sm">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-lg sm:rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-indigo-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1.5 sm:mb-2">No activity yet</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 max-w-sm mx-auto">Start solving questions to see your daily progress and performance insights</p>
                            <button className="px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm sm:text-base font-medium transition-colors">
                                Start Practice
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <SmartSubjectSession session={session} />


        </div>
    )
}

export default DashboardHome