"use client";

import { useMemo } from 'react';
import { useAuth as useAuthContext } from '@/context/AuthContext';
import { Role } from '@repo/db/enums';
import { Permission } from '@/types/auth.types';

// Simplified auth hook
export const useAuth = () => {
  const authContext = useAuthContext();

  // Quick role checks
  const isAdmin = useMemo(() => 
    authContext.user?.role === Role.ADMIN, 
    [authContext.user?.role]
  );

  const isInstructor = useMemo(() => 
    authContext.user?.role === Role.INSTRUCTOR, 
    [authContext.user?.role]
  );

  const isUser = useMemo(() => 
    authContext.user?.role === Role.USER, 
    [authContext.user?.role]
  );

  return {
    ...authContext,
    isAdmin,
    isInstructor, 
    isUser,
  };
};

// Simple permission hook
export const usePermissions = () => {
  const { hasPermission, user } = useAuthContext();

  const can = (permission: Permission) => {
    return hasPermission(permission);
  };

  return {
    can,
    userRole: user?.role,
  };
};

// Simple subscription hook
export const useSubscription = () => {
  const { user, isSubscriptionActive } = useAuthContext();

  return {
    subscription: user?.plan,
    isActive: isSubscriptionActive(),
    planId: user?.plan?.id,
    planStatus: user?.plan?.status,
  };
};

export default useAuth;
