# Splash Screen Implementation

This document describes the splash screen implementation for the RankMarg mobile app.

## Overview

The app includes a comprehensive splash screen system with:

- **Native splash screen** (configured in app.json)
- **Custom animated splash screen** (React component)
- **Loading splash component** (for in-app loading states)

## Components

### 1. Native Splash Screen (`app.json`)

The native splash screen is configured in `app.json` and shows immediately when the app launches:

```json
{
  "expo-splash-screen": {
    "image": "./assets/images/splash-icon.png",
    "imageWidth": 200,
    "resizeMode": "contain",
    "backgroundColor": "#F59E0B",
    "dark": {
      "backgroundColor": "#151718"
    }
  }
}
```

**Features:**

- Shows instantly on app launch
- Uses RankMarg brand colors
- Supports light/dark themes
- Automatically hidden when React Native takes over

### 2. Custom Splash Screen (`components/splash-screen.tsx`)

A fully animated splash screen component with:

**Animations:**

- Logo fade-in and scale animation
- Logo rotation effect
- Text slide-in animation
- Pulsing loading dots
- Smooth transitions

**Features:**

- Theme-aware (light/dark mode)
- Customizable duration
- Callback when animation completes
- Professional loading indicators

**Usage:**

```tsx
import { SplashScreen } from "@/components/splash-screen";

<SplashScreen
  onAnimationFinish={() => console.log("Animation complete")}
  duration={3000}
/>;
```

### 3. Loading Splash (`components/loading-splash.tsx`)

A simpler loading component for in-app loading states:

**Features:**

- Compact design
- Activity indicator
- Customizable message
- Theme-aware

**Usage:**

```tsx
import { LoadingSplash } from "@/components/loading-splash";

<LoadingSplash
  message="Loading your data..."
  showSpinner={true}
  size="large"
/>;
```

### 4. Splash Screen Hook (`hooks/use-splash-screen.ts`)

A custom hook to manage splash screen state:

**Features:**

- Prevents auto-hide of native splash
- Manages app readiness state
- Coordinates with custom splash animations
- Handles splash screen hiding

**Usage:**

```tsx
import { useSplashScreen } from "@/hooks/use-splash-screen";

const { isAppReady, onSplashAnimationFinish } = useSplashScreen();
```

## App Flow

1. **App Launch**: Native splash screen shows instantly
2. **React Native Loads**: Custom splash screen takes over
3. **Animations Play**: Logo animations and loading indicators
4. **App Ready**: Navigate to authentication screens
5. **Splash Hidden**: Native splash screen is hidden

## Customization

### Colors

Update colors in `constants/theme.ts`:

```tsx
const tintColorLight = "#F59E0B"; // Yellow-500
const tintColorDark = "#FCD34D"; // Yellow-300
```

### Duration

Modify splash screen duration in `app/index.tsx`:

```tsx
const timer = setTimeout(() => {
  setShowSplash(false);
}, 3000); // 3 seconds
```

### Animations

Customize animations in `components/splash-screen.tsx`:

```tsx
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 800, // Animation duration
  useNativeDriver: true,
});
```

## Assets

Required assets in `assets/images/`:

- `splash-icon.png` - Main splash screen icon
- `icon.png` - App icon
- `android-icon-*.png` - Android adaptive icons

## Best Practices

1. **Keep it brief**: Splash screens should be 2-4 seconds max
2. **Brand consistency**: Use consistent colors and logo
3. **Smooth transitions**: Ensure smooth handoff from native to custom splash
4. **Loading feedback**: Always show loading indicators
5. **Theme support**: Support both light and dark themes

## Troubleshooting

### Splash screen not hiding

- Ensure `SplashScreen.hideAsync()` is called
- Check that `isAppReady` and `isSplashAnimationComplete` are both true

### Animations not smooth

- Use `useNativeDriver: true` for better performance
- Avoid complex animations on the main thread

### Theme not updating

- Ensure `useThemeColor` hook is used correctly
- Check that theme colors are defined in `constants/theme.ts`

## Dependencies

Required packages:

- `expo-splash-screen` - Native splash screen management
- `react-native-reanimated` - Smooth animations
- `expo-status-bar` - Status bar management
