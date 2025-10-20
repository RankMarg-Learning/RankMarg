import { useMutation, useQuery, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import api from "@/utils/api";

// Generic API hook types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic query hook factory
export const createQueryHook = <TData = any, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) => {
  return () => useQuery({
    queryKey,
    queryFn,
    ...options,
  });
};

// Generic mutation hook factory
export const createMutationHook = <TData = any, TVariables = any, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables>
) => {
  return () => useMutation({
    mutationFn,
    ...options,
  });
};

// Common query keys
export const queryKeys = {
  // Add your app-specific query keys here
  // Example:
  // users: ['users'] as const,
  // user: (id: string) => ['users', id] as const,
  // posts: ['posts'] as const,
  // post: (id: string) => ['posts', id] as const,
};

// Utility hooks for common operations
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries(),
    invalidateByKey: (queryKey: readonly unknown[]) => 
      queryClient.invalidateQueries({ queryKey }),
    removeQueries: (queryKey: readonly unknown[]) => 
      queryClient.removeQueries({ queryKey }),
    clearAll: () => queryClient.clear(),
  };
};

// Generic API functions that can be reused
export const apiUtils = {
  get: async <T = any>(url: string): Promise<T> => {
    const response = await api.get(url);
    return response.data;
  },

  post: async <T = any, D = any>(url: string, data?: D): Promise<T> => {
    const response = await api.post(url, data);
    return response.data;
  },

  put: async <T = any, D = any>(url: string, data?: D): Promise<T> => {
    const response = await api.put(url, data);
    return response.data;
  },

  patch: async <T = any, D = any>(url: string, data?: D): Promise<T> => {
    const response = await api.patch(url, data);
    return response.data;
  },

  delete: async <T = any>(url: string): Promise<T> => {
    const response = await api.delete(url);
    return response.data;
  },
};
