"use client";

import React, { useState, useMemo } from "react";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  RefreshCw, 
  BookOpen,
  Target,
  Star,
  Users,
  CheckCircle2
} from "lucide-react";
import { Button } from "@repo/common-ui";
import { Skeleton } from "@repo/common-ui";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { UserNotification } from "@/types/notification.types";

const NotificationIcon = ({ type }: { type: string }) => {
  const config = {
    PRACTICE_SESSION: {
      icon: BookOpen,
      bgColor: "bg-primary-500/10",
      iconColor: "text-primary-600",
    },
    TEST_LIVE: {
      icon: Target,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-600",
    },
    MASTERY_UPDATE: {
      icon: Star,
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    WELCOME: {
      icon: Users,
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-600",
    },
    default: {
      icon: Bell,
      bgColor: "bg-gray-500/10",
      iconColor: "text-gray-600",
    },
  };

  const { icon: Icon, bgColor, iconColor } = config[type as keyof typeof config] || config.default;

  return (
    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", bgColor)}>
      <Icon className={cn("h-5 w-5", iconColor)} />
    </div>
  );
};

const NotificationCard = ({ 
  notification,
  onMarkAsRead,
  onDelete,
}: { 
  notification: UserNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const isUnread = notification.status === "UNREAD";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "group relative border-b border-gray-100 px-4 py-4 transition-all duration-200",
        "hover:bg-gray-50/50 cursor-pointer",
        isUnread && "bg-primary-50/30 hover:bg-primary-50/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Unread indicator */}
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
      )}

      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <NotificationIcon type={notification.notification.type} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  "text-sm font-medium text-gray-900 leading-snug",
                  isUnread && "font-semibold"
                )}>
                  {notification.notification.title}
                </h3>
                {isUnread && (
                  <div className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                {notification.notification.message}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium">
                  {formatDistanceToNow(new Date(notification.deliveredAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Action buttons - show on hover */}
            <div className={cn(
              "flex items-center gap-1 flex-shrink-0 transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0 sm:opacity-100"
            )}>
              {isUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.notificationId);
                  }}
                  className="h-8 w-8 p-0 hover:bg-primary-100"
                  title="Mark as read"
                >
                  <CheckCircle2 size={16} className="text-primary-600" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.notificationId);
                }}
                className="h-8 w-8 p-0 hover:bg-red-100"
                title="Delete"
              >
                <Trash2 size={16} className="text-gray-500 hover:text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Group notifications by time period
const groupNotificationsByTime = (notifications: UserNotification[]) => {
  const groups: {
    today: UserNotification[];
    yesterday: UserNotification[];
    thisWeek: UserNotification[];
    earlier: UserNotification[];
  } = {
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: [],
  };

  notifications.forEach((notification) => {
    const date = new Date(notification.deliveredAt);
    if (isToday(date)) {
      groups.today.push(notification);
    } else if (isYesterday(date)) {
      groups.yesterday.push(notification);
    } else if (isThisWeek(date)) {
      groups.thisWeek.push(notification);
    } else {
      groups.earlier.push(notification);
    }
  });

  return groups;
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch, isRefetching } = useNotifications(page, limit);
  const { data: countData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = data?.notifications || [];
  const totalPages = data?.totalPages || 1;
  const unreadCount = countData?.count || 0;

  const groupedNotifications = useMemo(
    () => groupNotificationsByTime(notifications),
    [notifications]
  );

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification.mutate(notificationId);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Header - Fixed at top */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  Notifications
                </h1>
               
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="h-9 w-9 p-0"
                  title="Refresh"
                >
                  <RefreshCw size={16} className={cn(
                    "text-gray-600 transition-transform",
                    isRefetching && "animate-spin"
                  )} />
                </Button>
                
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsRead.isPending}
                    className="h-9 px-3 text-sm font-medium"
                  >
                    <CheckCheck size={16} className="mr-2" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {/* Tab-like filters (can be extended later) */}
            <div className="flex items-center gap-4 mt-4">
              <button className="text-sm font-medium text-primary-600 border-b-2 border-primary-600 pb-2">
                All
              </button>
              <button className="text-sm font-medium text-gray-500 hover:text-gray-700 pb-2 hidden">
                Unread
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Bell size={28} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                No notifications
              </h3>
              <p className="text-sm text-gray-500">
                When you get notifications, they'll show up here
              </p>
            </div>
          ) : (
            <>
              {/* Today */}
              {groupedNotifications.today.length > 0 && (
                <div>
                  <div className="px-6 py-3 bg-gray-50/50">
                    <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Today
                    </h2>
                  </div>
                  {groupedNotifications.today.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {/* Yesterday */}
              {groupedNotifications.yesterday.length > 0 && (
                <div>
                  <div className="px-6 py-3 bg-gray-50/50">
                    <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Yesterday
                    </h2>
                  </div>
                  {groupedNotifications.yesterday.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {/* This Week */}
              {groupedNotifications.thisWeek.length > 0 && (
                <div>
                  <div className="px-6 py-3 bg-gray-50/50">
                    <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      This Week
                    </h2>
                  </div>
                  {groupedNotifications.thisWeek.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {/* Earlier */}
              {groupedNotifications.earlier.length > 0 && (
                <div>
                  <div className="px-6 py-3 bg-gray-50/50">
                    <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Earlier
                    </h2>
                  </div>
                  {groupedNotifications.earlier.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-6 border-t border-gray-200 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="font-medium"
            >
              ← Previous
            </Button>
            
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="font-medium"
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

