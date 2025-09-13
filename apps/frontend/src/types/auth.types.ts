import { Role, SubscriptionStatus } from "@repo/db/enums";

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string | null;
  role: Role;
  examCode?: string;
  isNewUser: boolean;
  createdAt?: Date;
  plan: {
    id: string | null;
    status: SubscriptionStatus;
    endAt: Date | null;
  };
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  lastFetched: number | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string; redirectTo?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  hasRole: (requiredRole: Role | Role[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isSubscriptionActive: () => boolean;
  getRedirectPath: () => string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignUpData {
  fullname: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    accessToken: string;
  };
}

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  [Role.ADMIN]: 3,
  [Role.INSTRUCTOR]: 2,
  [Role.USER]: 1,
} as const;

// Permissions mapping
export const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_CONTENT: 'manage_content',
  VIEW_ANALYTICS: 'view_analytics',
  SYSTEM_SETTINGS: 'system_settings',
  
  // Instructor permissions
  CREATE_TESTS: 'create_tests',
  GRADE_SUBMISSIONS: 'grade_submissions',
  VIEW_STUDENT_PROGRESS: 'view_student_progress',
  
  // User permissions
  TAKE_TESTS: 'take_tests',
  VIEW_PROGRESS: 'view_progress',
  ACCESS_CONTENT: 'access_content',
} as const;

// Role-based permissions
export const ROLE_PERMISSIONS = {
  [Role.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.CREATE_TESTS,
    PERMISSIONS.GRADE_SUBMISSIONS,
    PERMISSIONS.VIEW_STUDENT_PROGRESS,
    PERMISSIONS.TAKE_TESTS,
    PERMISSIONS.VIEW_PROGRESS,
    PERMISSIONS.ACCESS_CONTENT,
  ],
  [Role.INSTRUCTOR]: [
    PERMISSIONS.CREATE_TESTS,
    PERMISSIONS.GRADE_SUBMISSIONS,
    PERMISSIONS.VIEW_STUDENT_PROGRESS,
    PERMISSIONS.TAKE_TESTS,
    PERMISSIONS.VIEW_PROGRESS,
    PERMISSIONS.ACCESS_CONTENT,
  ],
  [Role.USER]: [
    PERMISSIONS.TAKE_TESTS,
    PERMISSIONS.VIEW_PROGRESS,
    PERMISSIONS.ACCESS_CONTENT,
  ],
} as const;

// Simplified route types for middleware
export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/contact',
  '/terms',
  '/privacy',
];

export const AUTH_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
