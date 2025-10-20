# Mobile App Configuration

This directory contains configuration files for the mobile app.

## API Configuration (`api.ts`)

The API configuration provides centralized settings for API calls:

### Environment Variables

The app uses the following environment variables (in order of priority):

1. **Expo Config** (`app.json`): `extra.apiBaseUrl`
2. **Environment Variable**: `EXPO_PUBLIC_API_BASE_URL`
3. **Default**: `http://localhost:3001`

### Configuration Options

```typescript
export const API_CONFIG = {
  baseURL: "http://localhost:3001", // API base URL
  timeout: {
    default: 10000,     // 10 seconds for development
    production: 30000,  // 30 seconds for production
  },
  retry: {
    maxRetries: 1,      // Maximum retry attempts
    backoffMultiplier: 2, // Exponential backoff multiplier
    baseDelay: 200,     // Base delay in milliseconds
  },
  isDevelopment: __DEV__, // Development mode flag
  isProduction: !__DEV__, // Production mode flag
};
```

### API Endpoints

All API endpoints are centralized in `API_ENDPOINTS`:

```typescript
export const API_ENDPOINTS = {
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    signOut: '/auth/sign-out',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    me: '/auth/profile',
  },
  // Add more endpoints as needed
};
```

## Setting Up Environment Variables

### For Development

1. Create a `.env` file in the mobile directory:
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

2. Or update `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://localhost:3001"
    }
  }
}
```

### For Production

Update the configuration to point to your production API:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://your-api-domain.com"
    }
  }
}
```

## Usage

```typescript
import { API_CONFIG, API_ENDPOINTS, getApiUrl } from '@/src/config/api';

// Use in API calls
const response = await fetch(getApiUrl(API_ENDPOINTS.auth.signIn));

// Check environment
if (API_CONFIG.isDevelopment) {
  console.log('Development mode');
}
```

## Benefits

- **Centralized Configuration**: All API settings in one place
- **Environment Flexibility**: Easy switching between dev/prod
- **Type Safety**: Full TypeScript support
- **Consistent Endpoints**: Standardized API endpoint management
- **React Native Compatible**: No Node.js dependencies
