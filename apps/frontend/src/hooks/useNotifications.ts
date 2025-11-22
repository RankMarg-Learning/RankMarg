import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { toast } from "@/hooks/use-toast";

export const useNotifications = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => notificationService.getNotifications(page, limit),
    staleTime: 30000, // 30 seconds
  });
};

export const useRecentNotifications = () => {
  return useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationService.getRecentNotifications(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => 
      notificationService.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot previous values
      const previousRecent = queryClient.getQueryData(["notifications", "recent"]);
      const previousCount = queryClient.getQueryData(["notifications", "unread-count"]);

      // Optimistically update
      queryClient.setQueryData(["notifications", "recent"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.map((n: any) =>
            n.notificationId === notificationId
              ? { ...n, status: "READ", readAt: new Date() }
              : n
          ),
        };
      });

      queryClient.setQueryData(["notifications", "unread-count"], (old: any) => {
        if (!old) return old;
        return { count: Math.max(0, old.count - 1) };
      });

      return { previousRecent, previousCount };
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      if (context?.previousRecent) {
        queryClient.setQueryData(["notifications", "recent"], context.previousRecent);
      }
      if (context?.previousCount) {
        queryClient.setQueryData(["notifications", "unread-count"], context.previousCount);
      }
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousRecent = queryClient.getQueryData(["notifications", "recent"]);
      const previousCount = queryClient.getQueryData(["notifications", "unread-count"]);

      // Optimistically update all to read
      queryClient.setQueryData(["notifications", "recent"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.map((n: any) => ({
            ...n,
            status: "READ",
            readAt: new Date(),
          })),
        };
      });

      queryClient.setQueryData(["notifications", "unread-count"], () => ({ count: 0 }));

      return { previousRecent, previousCount };
    },
    onError: (err, variables, context) => {
      if (context?.previousRecent) {
        queryClient.setQueryData(["notifications", "recent"], context.previousRecent);
      }
      if (context?.previousCount) {
        queryClient.setQueryData(["notifications", "unread-count"], context.previousCount);
      }
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    },
  });
};

