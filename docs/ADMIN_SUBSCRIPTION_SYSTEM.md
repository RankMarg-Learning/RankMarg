# Admin Subscription Management System

## Overview

This document describes the admin subscription management system that allows administrators to assign and manage user subscriptions by userId, username, or email.

## Features

### Backend API

**Location**: `apps/backend/src/controllers/subscription/adminSubscription.controller.ts`

#### Endpoints

1. **Assign Subscription** - `POST /api/admin/subscriptions/assign`
   - Assign a subscription to a user by userId, username, or email
   - If user already has a subscription, it updates the existing one
   - Can extend existing subscriptions or create new ones
   - Automatically calculates end dates based on duration

2. **Get All Subscriptions** - `GET /api/admin/subscriptions`
   - Retrieve all subscriptions with pagination
   - Filter by status and search by user name, email, or username
   - Returns user details and plan information

3. **Get User Subscription** - `GET /api/admin/subscriptions/user`
   - Get a specific user's subscription by userId, username, or email
   - Returns complete subscription details with user and plan info

4. **Update Subscription** - `PATCH /api/admin/subscriptions/user`
   - Update subscription status, duration, or plan
   - Extends subscription from existing end date
   - Can change subscription tier

5. **Cancel Subscription** - `DELETE /api/admin/subscriptions/user`
   - Cancel a user's subscription (marks as CANCELLED)
   - Does not delete the subscription record for audit purposes

#### Security

All endpoints are protected by:
- `authenticate` middleware - Validates JWT token
- `isAdmin` middleware - Ensures user has ADMIN role

**Routes**: `apps/backend/src/routes/subscription/adminSubscription.routes.ts`

### Frontend UI

**Location**: `apps/frontend/src/app/(admin)/admin/user-subscriptions/page.tsx`

#### Features

- **Assign Subscription Dialog**
  - Three tabs: User ID, Username, Email
  - Select from existing plans
  - Set custom duration
  - Choose subscription status

- **Subscription List**
  - Search by name, email, or username
  - Filter by status (Active, Trial, Cancelled, Expired)
  - Pagination support
  - Display user avatar, name, email, username
  - Show plan details, end date, and status badge

- **Edit Subscription**
  - Change plan
  - Update status
  - Modify duration
  - Extends from existing end date

- **Cancel Subscription**
  - Confirmation dialog
  - Marks subscription as CANCELLED

#### Services

**Location**: `apps/frontend/src/services/subscription.service.ts`

Added `adminSubscriptionService` with methods:
- `assignSubscription(data)` - Assign subscription to user
- `getSubscriptions(params)` - Get all subscriptions with filters
- `getUserSubscription(params)` - Get specific user's subscription
- `updateSubscription(identifier, data)` - Update subscription
- `cancelSubscription(identifier)` - Cancel subscription

### Navigation

Added "User Subscriptions" link to admin sidebar with Users icon.

**Location**: `apps/frontend/src/components/admin/AdminSidebar.tsx`

## Usage Examples

### Assign Subscription via User ID

```typescript
await adminSubscriptionService.assignSubscription({
  userId: "user-123",
  planId: "plan-456",
  duration: 30,
  status: "ACTIVE"
})
```

### Assign Subscription via Email

```typescript
await adminSubscriptionService.assignSubscription({
  email: "user@example.com",
  planId: "plan-456",
  duration: 90,
  status: "ACTIVE"
})
```

### Extend Existing Subscription

```typescript
await adminSubscriptionService.updateSubscription(
  { userId: "user-123" },
  { duration: 30 } // Adds 30 days from existing end date
)
```

### Get User's Subscription

```typescript
const subscription = await adminSubscriptionService.getUserSubscription({
  username: "johndoe"
})
```

### Filter Subscriptions

```typescript
const subscriptions = await adminSubscriptionService.getSubscriptions({
  status: "ACTIVE",
  search: "john",
  page: 1,
  limit: 20
})
```

## Database Schema

The system uses the existing `Subscription` table:

```prisma
model Subscription {
  id                String    @id @default(uuid())
  userId            String    @unique
  planId            String?
  duration          Int?
  status            String    @default("TRIAL") @db.Text
  provider          String    @db.Text
  providerId        String?
  amount            Float
  discountApplied   Float?    @default(0)
  promoCodeUsed     String?
  trialEndsAt       DateTime?
  currentPeriodEnd  DateTime?
  cancelAtPeriodEnd Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan     Plan?     @relation(fields: [planId], references: [id])
  payments Payment[]
}
```

## Benefits

1. **Flexible User Lookup**: Find users by ID, username, or email
2. **Intelligent Extensions**: Automatically extends from existing end dates
3. **Audit Trail**: Cancellations mark status, don't delete records
4. **Plan Management**: Easy to change plans or upgrade/downgrade users
5. **Bulk Operations**: Pagination and filtering for large user bases
6. **Secure**: Admin-only access with proper authentication
7. **User-Friendly**: Clean UI with search, filters, and status badges

## Security Considerations

- All endpoints require admin authentication
- JWT token validation
- Role-based access control (ADMIN only)
- Input validation for user identifiers
- Prevents unauthorized subscription modifications

## Future Enhancements

Potential improvements:
- Bulk subscription assignment
- Subscription history/audit log
- Email notifications on subscription changes
- Export subscriptions to CSV
- Subscription analytics dashboard
- Scheduled subscription changes
- Trial to paid conversion tracking

