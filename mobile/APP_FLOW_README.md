# RankMarg Mobile App Flow

This document describes the complete user flow for the RankMarg mobile application.

## App Flow Overview

The app follows this user journey:

```
App Launch → Splash Screen → Auth Entry → Login/Signup → Onboarding → Main App
```

## Detailed Flow

### 1. App Launch

- **File**: `app/index.tsx`
- **Duration**: 3 seconds
- **Features**:
  - Custom animated splash screen
  - Logo rotation and fade-in animations
  - Loading indicators
  - Theme-aware (light/dark mode)

### 2. Auth Entry Screen

- **File**: `app/(auth)/index.tsx`
- **Purpose**: Welcome screen with sign-in/sign-up options
- **Features**:
  - RankMarg branding
  - Two main actions: Sign In / Create Account
  - Clean, professional design
  - Theme support

### 3. Authentication Screens

- **Sign In**: `app/(auth)/sign-in.tsx`
- **Sign Up**: `app/(auth)/sign-up.tsx`
- **Forgot Password**: `app/(auth)/forgot-password.tsx`
- **Reset Password**: `app/(auth)/reset-password.tsx`

**Demo Flow**: After successful login/signup, users are redirected to onboarding.

### 4. Onboarding Screen

- **File**: `app/(auth)/onboarding.tsx`
- **Purpose**: Introduce users to app features
- **Features**:
  - 4-step guided tour
  - Progress indicators
  - Feature highlights
  - Skip option
  - Back navigation

**Steps**:

1. Welcome to RankMarg
2. Smart Practice Sessions
3. Track Your Progress
4. Mock Test Simulations

### 5. Main App

- **File**: `app/(tabs)/`
- **Purpose**: Main application interface
- **Features**:
  - Tab navigation
  - Home screen with features
  - Explore screen with detailed information
  - Theme toggle

## Navigation Structure

```
app/
├── index.tsx (Splash Screen)
├── (auth)/
│   ├── index.tsx (Auth Entry)
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   └── onboarding.tsx
└── (tabs)/
    ├── index.tsx (Home)
    └── explore.tsx
```

## Demo Credentials

For testing purposes, use any credentials:

- **Email**: Any valid email format
- **Password**: Any password (minimum 6 characters)
- **Username**: Any username (for signup)

## Key Features

### Theme Support

- Light and dark mode
- Automatic system theme detection
- Theme toggle in main app
- Consistent theming across all screens

### Animations

- Smooth transitions between screens
- Loading animations
- Logo animations
- Progress indicators

### Responsive Design

- Works on all screen sizes
- Adaptive layouts
- Touch-friendly interface

## Testing the Flow

1. **Launch App**: See splash screen with animations
2. **Auth Entry**: Choose Sign In or Create Account
3. **Login**: Use any credentials (demo mode)
4. **Onboarding**: Go through 4-step tour
5. **Main App**: Explore features and toggle theme

## Customization

### Colors

Update `constants/theme.ts`:

```tsx
const tintColorLight = "#F59E0B"; // Yellow-500
const tintColorDark = "#FCD34D"; // Yellow-300
```

### Splash Duration

Modify in `app/index.tsx`:

```tsx
const timer = setTimeout(() => {
  setShowSplash(false);
}, 3000); // 3 seconds
```

### Onboarding Steps

Edit `app/(auth)/onboarding.tsx`:

```tsx
const onboardingSteps: OnboardingStep[] = [
  // Add/modify steps here
];
```

## Dependencies

Required packages:

- `expo-router` - File-based routing
- `expo-splash-screen` - Splash screen management
- `react-native-reanimated` - Animations
- `expo-status-bar` - Status bar management
- `lucide-react-native` - Icons
- `react-hook-form` - Form handling
- `zod` - Form validation

## Best Practices

1. **Smooth Transitions**: All navigation uses smooth animations
2. **Loading States**: Every async operation shows loading indicators
3. **Error Handling**: Proper error messages and fallbacks
4. **Accessibility**: Screen reader support and proper contrast
5. **Performance**: Optimized animations and lazy loading
