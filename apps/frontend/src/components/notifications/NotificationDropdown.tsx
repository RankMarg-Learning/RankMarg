"use client";

import React from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { Button } from "@repo/common-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@repo/common-ui";
import { Badge } from "@repo/common-ui";
import { ScrollArea } from "@repo/common-ui";
import { Skeleton } from "@repo/common-ui";
import {
  useRecentNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserNotification } from "@/types/notification.types";

const NotificationIcon = ({ type }: { type: string }) => {
  const iconClass = "h-4 w-4";

  switch (type) {
    case "PRACTICE_SESSION":
      return <span className={cn(iconClass, "text-blue-500")}>📚</span>;
    case "TEST_LIVE":
      return <span className={cn(iconClass, "text-green-500")}>🎯</span>;
    case "MASTERY_UPDATE":
      return <span className={cn(iconClass, "text-purple-500")}>⭐</span>;
    case "WELCOME":
      return <span className={cn(iconClass, "text-pink-500")}>👋</span>;
    default:
      return <span className={cn(iconClass, "text-gray-500")}>🔔</span>;
  }
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
}: {
  notification: UserNotification;
  onMarkAsRead: (id: string) => void;
}) => {
  const isUnread = notification.status === "UNREAD";

  return (
    <div
      className={cn(
        "p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0",
        isUnread && "bg-blue-50/30"
      )}
      onClick={() => isUnread && onMarkAsRead(notification.notificationId)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <NotificationIcon type={notification.notification.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-sm font-medium text-gray-900 line-clamp-1",
              isUnread && "font-semibold"
            )}>
              {notification.notification.title}
            </h4>
            {isUnread && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
            {notification.notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.deliveredAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};

export function NotificationDropdown() {
  const { data: recentData, isLoading: isLoadingRecent } = useRecentNotifications();
  const { data: countData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = countData?.count || 0;
  const notifications = recentData?.notifications || [];

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild >
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10  "
        >
          <Bell size={18} className="sm:w-5 sm:h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px] text-white bg-green-600 "
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-7 text-xs"
              >
                <CheckCheck size={14} className="mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {isLoadingRecent ? (
            <div className="p-3 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link href="/notifications" className="block">
                <Button variant="ghost" className="w-full justify-center text-sm h-9">
                  <ExternalLink size={14} className="mr-2" />
                  View all notifications
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

