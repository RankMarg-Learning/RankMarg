# Subscription System Implementation

## Overview

I've implemented a comprehensive subscription management system for your RankMarg application that handles different subscription tiers, access controls, and usage limits. The system is designed to be scalable and maintainable.

## 🏗️ **Architecture**

### Backend Components

#### 1. **Subscription Utility (`apps/backend/src/utils/subscription.util.ts`)**

- **Subscription Plans Configuration**: Defines trial, basic, and premium plans with their features and limits
- **Access Control Methods**: Check access to specific features like mastery dashboard, subject mastery, etc.
- **Usage Tracking**: Monitor feature usage against limits
- **Upgrade Recommendations**: Provide personalized upgrade suggestions

#### 2. **Subscription Middleware (`apps/backend/src/middleware/subscription.middleware.ts`)**

- **Feature Access Control**: Middleware to protect API endpoints based on subscription
- **Usage Limit Enforcement**: Check and enforce usage limits for features
- **Subscription Info Injection**: Add subscription details to request objects

#### 3. **Updated Mastery Controller (`apps/backend/src/controllers/mastery.controller.ts`)**

- **Subscription-Aware Responses**: Include subscription info in API responses
- **Access Control Integration**: Use subscription system for access validation
- **Enhanced Error Handling**: Better error messages for subscription issues

### Frontend Components

#### 1. **Subscription Hook (`apps/frontend/src/hooks/useSubscription.ts`)**

- **Error Detection**: Identify subscription-related errors
- **Feature Access Checking**: Determine if user has access to features
- **Upgrade Recommendations**: Get personalized upgrade suggestions
- **Subscription-Aware Queries**: Handle API calls with subscription error handling

#### 2. **Updated Mastery Dashboard Hook (`apps/frontend/src/hooks/useMasteryDashboard.ts`)**

- **Subscription Error Handling**: Detect and handle subscription errors
- **Retry Logic**: Don't retry subscription errors
- **Subscription Info Extraction**: Get subscription details from API responses

#### 3. **Subscription Error Component (`apps/frontend/src/components/SubscriptionError.tsx`)**

- **Professional Error UI**: Beautiful error display for subscription issues
- **Usage Visualization**: Show usage limits and progress
- **Upgrade Prompts**: Encourage users to upgrade with benefits
- **Responsive Design**: Works on all device sizes

#### 4. **Updated Mastery Dashboard (`apps/frontend/src/components/mastery/MasteryDashboard.tsx`)**

- **Subscription Status Banner**: Show current plan and access level
- **Feature Access Indicators**: Visual indicators for limited access
- **Upgrade Cards**: Contextual upgrade prompts
- **Subscription-Aware UI**: Different UI based on subscription level

## 📋 **Subscription Plans**

### Trial Plan

- **Mastery Dashboard**: Limited access
- **Subject Mastery**: Limited access
- **Full Mastery Details**: Restricted
- **AI Recommendations**: Not available
- **Tests**: 2 per month
- **Practice Questions**: 10 per day

### Basic Plan

- **Mastery Dashboard**: Unlimited access
- **Subject Mastery**: Unlimited access
- **Full Mastery Details**: Unlimited access
- **AI Recommendations**: Not available
- **Tests**: 10 per month
- **Practice Questions**: 50 per day

### Premium Plan

- **Mastery Dashboard**: Unlimited access
- **Subject Mastery**: Unlimited access
- **Full Mastery Details**: Unlimited access
- **AI Recommendations**: Available
- **Tests**: Unlimited
- **Practice Questions**: Unlimited

## 🔧 **Key Features**

### 1. **Flexible Access Control**

- Three access levels: `unlimited`, `limited`, `restricted`
- Feature-specific access control
- Easy to add new features and plans

### 2. **Usage Tracking**

- Monthly and daily limits
- Real-time usage monitoring
- Automatic limit enforcement

### 3. **Professional Error Handling**

- Beautiful error UI components
- Clear upgrade prompts
- Usage visualization
- Responsive design

### 4. **Subscription-Aware UI**

- Dynamic UI based on subscription level
- Upgrade recommendations
- Feature access indicators
- Status banners

### 5. **Scalable Architecture**

- Easy to add new subscription plans
- Simple feature access control
- Reusable components
- Type-safe implementation

## 🚀 **Usage Examples**

### Backend - Protecting an API Endpoint

```typescript
// In your route file
router.get(
  "/mastery",
  authenticate,
  requireSubscriptionAccess("masteryDashboard"),
  masteryController.getMasteryDashboard
);
```

### Frontend - Using Subscription Hook

```typescript
const { hasFeatureAccess, getSubscriptionError } = useSubscription();

// Check if user has access to a feature
const hasAccess = hasFeatureAccess(subscription, "fullMasteryDetails");

// Handle subscription errors
if (isSubscriptionError(error)) {
  const subscriptionError = getSubscriptionError(error);
  // Show upgrade prompt
}
```

### Frontend - Subscription-Aware Component

```typescript
const { subscription, subscriptionError } = useMasteryDashboard();

if (subscriptionError) {
  return <SubscriptionError error={subscriptionError} />;
}

// Show different UI based on subscription
{subscription?.isTrial && <UpgradePrompt />}
```

## 🔄 **Integration Points**

### 1. **API Routes**

- Add subscription middleware to protected routes
- Update controllers to use subscription system
- Include subscription info in responses

### 2. **Frontend Components**

- Use subscription hooks for error handling
- Add subscription-aware UI elements
- Implement upgrade flows

### 3. **Database**

- Ensure subscription tables are properly set up
- Add usage tracking tables if needed
- Update user registration to create trial subscriptions

## 📈 **Benefits**

1. **Monetization**: Clear upgrade paths and usage limits
2. **User Experience**: Professional error handling and clear messaging
3. **Scalability**: Easy to add new plans and features
4. **Maintainability**: Centralized subscription logic
5. **Flexibility**: Configurable plans and limits
6. **Professional**: Beautiful UI components and error handling

## 🎯 **Next Steps**

1. **Test the Implementation**: Test with different subscription levels
2. **Add More Features**: Extend to other parts of the application
3. **Analytics**: Add usage analytics and reporting
4. **Payment Integration**: Connect with your payment system
5. **Email Notifications**: Add subscription-related email notifications

The system is now ready to handle subscription-based access control throughout your application with a professional, user-friendly experience!
