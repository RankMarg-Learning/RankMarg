# TanStack Query API Hooks

This directory contains React hooks for API management using TanStack Query (React Query).

## Setup

The QueryClient and provider are already configured in `app/_layout.tsx`.

## Available Hooks

### Auth Hooks (`useAuth.ts`)

- `useSignIn()` - Sign in mutation
- `useSignUp()` - Sign up mutation  
- `useForgotPassword()` - Forgot password mutation
- `useResetPassword()` - Reset password mutation
- `useSignOut()` - Sign out mutation
- `useCurrentUser()` - Get current user query

### Generic API Hooks (`useApi.ts`)

- `createQueryHook()` - Factory for creating query hooks
- `createMutationHook()` - Factory for creating mutation hooks
- `useInvalidateQueries()` - Utility for invalidating queries
- `apiUtils` - Generic API functions (get, post, put, patch, delete)

## Usage Examples

### Using Auth Mutations

```tsx
import { useSignIn } from '@/hooks/useAuth';

function SignInScreen() {
  const signInMutation = useSignIn();
  
  const handleSignIn = (credentials) => {
    signInMutation.mutate(credentials, {
      onSuccess: (data) => {
        // Handle success
        console.log('Signed in:', data);
      },
      onError: (error) => {
        // Handle error
        console.error('Sign in failed:', error);
      },
    });
  };

  return (
    <TouchableOpacity 
      onPress={() => handleSignIn({ username: 'user', password: 'pass' })}
      disabled={signInMutation.isPending}
    >
      {signInMutation.isPending ? 'Signing in...' : 'Sign In'}
    </TouchableOpacity>
  );
}
```

### Using Queries

```tsx
import { useCurrentUser } from '@/hooks/useAuth';

function ProfileScreen() {
  const { data: user, isLoading, error } = useCurrentUser();
  
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return <Text>Welcome, {user?.data?.username}!</Text>;
}
```

### Creating Custom Hooks

```tsx
import { createQueryHook, createMutationHook } from '@/hooks/useApi';

// Create a query hook
const useUsers = createQueryHook(
  ['users'],
  () => apiUtils.get('/users'),
  { staleTime: 5 * 60 * 1000 } // 5 minutes
);

// Create a mutation hook
const useCreateUser = createMutationHook(
  (userData) => apiUtils.post('/users', userData),
  {
    onSuccess: () => {
      // Invalidate users query
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  }
);
```

## Benefits

- **Automatic caching** - Queries are cached and reused
- **Background refetching** - Data stays fresh automatically
- **Optimistic updates** - UI updates immediately
- **Error handling** - Built-in retry and error states
- **Loading states** - Easy access to loading/pending states
- **Offline support** - Works offline with cached data
- **DevTools** - Great debugging experience

## Query Keys

Use consistent query keys for proper cache management:

```tsx
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  posts: ['posts'] as const,
  post: (id: string) => ['posts', id] as const,
};
```
