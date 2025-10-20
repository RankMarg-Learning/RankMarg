# Mobile App Authentication Flow

This document describes the complete authentication flow implemented in the RankMarg mobile app.

## Overview

The app implements a complete authentication system with the following features:
- User registration and login
- Persistent authentication state
- Automatic login on app restart
- Role-based access control
- Onboarding flow for new users
- Beautiful dashboard interface

## Flow Description

### 1. App Launch
- App starts with a splash screen showing "Checking authentication status..."
- The app checks for stored authentication tokens and user data
- If valid tokens exist, user is automatically logged in
- If no tokens or invalid tokens, user is redirected to auth screens

### 2. Authentication Screens
- **Auth Index**: Welcome screen with "Sign In" and "Create Account" buttons
- **Sign In**: Login form with email/username and password
- **Sign Up**: Registration form with username, email, and password
- **Forgot Password**: Password reset functionality (existing)

### 3. Post-Authentication Flow
- **New Users**: Redirected to onboarding screen with welcome tour
- **Existing Users**: Redirected directly to dashboard
- **All Users**: Eventually land on the dashboard after completing their respective flows

### 4. Dashboard
- Welcome screen with user information
- Quick action buttons for common tasks
- User stats and profile information
- Sign out functionality

### 5. Onboarding (New Users)
- Multi-step welcome tour
- Introduction to app features
- Option to skip tour
- Automatic redirect to dashboard after completion

## Technical Implementation

### Key Components

1. **AuthContext** (`src/context/AuthContext.tsx`)
   - Manages global authentication state
   - Provides user data and authentication status
   - Handles role-based access control

2. **RouteGuard** (`src/components/RouteGuard.tsx`)
   - Protects routes based on authentication status
   - Handles loading states and redirects

3. **Storage Utils** (`src/utils/storage.ts`)
   - Manages token persistence using AsyncStorage
   - Handles user data caching
   - Provides secure token management

4. **API Integration** (`utils/api.ts`)
   - Automatic token attachment to requests
   - Token refresh handling
   - Error handling and retry logic

### Authentication Hooks

- `useSignIn()`: Handles user login
- `useSignUp()`: Handles user registration
- `useSignOut()`: Handles user logout
- `useCurrentUser()`: Fetches current user data
- `useAuthContext()`: Access to authentication state

### Navigation Flow

```
App Launch
    ↓
Splash Screen (Loading)
    ↓
Check Auth Status
    ↓
┌─────────────────┬─────────────────┐
│   Not Auth      │    Authenticated│
│        ↓        │        ↓        │
│   Auth Screens  │  New User?      │
│   (Sign In/Up)  │        ↓        │
│        ↓        │  ┌─────┬─────┐  │
│   Auth Success  │  │ Yes │ No  │  │
│        ↓        │  │  ↓  │  ↓  │  │
│   Redirect to   │  │ On- │ Dash│  │
│   Dashboard     │  │ board│board│  │
└─────────────────┴─────────────────┘
```

## Features

### ✅ Implemented
- Complete authentication flow
- Persistent login state
- Beautiful UI with Tailwind CSS
- Role-based access control
- Onboarding for new users
- Dashboard with user information
- Sign out functionality
- Loading states and error handling

### 🔄 Future Enhancements
- Google OAuth integration
- Biometric authentication
- Push notifications
- Offline mode support
- Advanced user profile management

## Usage

1. **First Time Users**:
   - Open app → Auth screens → Sign up → Onboarding → Dashboard

2. **Returning Users**:
   - Open app → Automatic login → Dashboard

3. **Sign Out**:
   - Dashboard → Sign Out button → Auth screens

## Security Features

- Secure token storage using AsyncStorage
- Automatic token attachment to API requests
- Token cleanup on sign out
- Role-based route protection
- Input validation and error handling

## Dependencies

- `@react-native-async-storage/async-storage`: Token persistence
- `@tanstack/react-query`: Data fetching and caching
- `expo-router`: Navigation
- `nativewind`: Styling
- `axios`: HTTP client

## File Structure

```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── index.tsx          # Auth welcome screen
│   │   ├── sign-in.tsx        # Login screen
│   │   ├── sign-up.tsx        # Registration screen
│   │   └── _layout.tsx        # Auth layout
│   ├── dashboard.tsx          # Main dashboard
│   ├── onboarding.tsx         # New user onboarding
│   ├── index.tsx              # App entry point
│   └── _layout.tsx            # Root layout
├── src/
│   ├── components/
│   │   ├── RouteGuard.tsx     # Route protection
│   │   └── SplashScreen.tsx   # Loading screen
│   ├── context/
│   │   └── AuthContext.tsx    # Auth state management
│   └── utils/
│       └── storage.ts         # Token storage utilities
├── hooks/
│   └── useAuth.ts             # Authentication hooks
└── utils/
    └── api.ts                 # API configuration
```

This implementation provides a complete, production-ready authentication system for the RankMarg mobile app.
