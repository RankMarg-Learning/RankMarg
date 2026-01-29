import { Avatar, AvatarFallback, AvatarImage, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Skeleton } from "@repo/common-ui"
import { Crown, LogOut, Settings, User } from "lucide-react"
import Link from "next/link"
import { NotificationDropdown } from "../notifications/NotificationDropdown"
import { useRouter } from "next/navigation"
import api from "@/utils/api"

const HeaderHome = ({ isLoading, user }: { isLoading: boolean, user: any }) => {
    const router = useRouter();
    const handleSignOut = async () => {
        try {
            const res = await api.post("/auth/sign-out");
            if (res.data.success) {
                router.push("/sign-in");
            }
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }
    return (
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

    )
}

export default HeaderHome