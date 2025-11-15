# Admin User Management & Subscription System

## Overview

A comprehensive admin system for managing users and subscriptions with optimized workflows, real-time statistics, and role management.

## Key Features

### 1. User Search & Management
- **Single User Focus**: Search by userId, username, or email to find and manage individual users
- **User Details Display**: Complete user profile with subscription, stats, and activity counts
- **Role Management**: Update user roles (USER, INSTRUCTOR, ADMIN) dynamically
- **Optimized Workflow**: Find user first, then manage their subscription

### 2. Subscription Management
- **Assign/Update Subscriptions**: Assign new subscriptions or update existing ones
- **Intelligent Extensions**: Automatically extends from current end date when applicable
- **Cancel Subscriptions**: Soft delete for audit trail
- **Plan Selection**: Choose from available plans or custom duration

### 3. Real-Time Statistics Dashboard
- **Trial Users**: Count of users on trial subscriptions
- **Paid Users**: Count of active paid users
- **Total Users**: Combined active user count
- **Total Earnings**: Revenue from paid subscriptions
- **Date Filters**: All Time, Today, Last 7 Days, Last 30 Days, Last Year

### 4. Optimized Architecture
- **Backend**: Efficient Prisma queries with parallel aggregation
- **Frontend**: Search-first UI with minimal load times
- **Real-time Updates**: Statistics refresh automatically after changes
- **Error Handling**: Comprehensive error messages and validation

## Backend API

### Subscription Statistics
**Endpoint**: `GET /api/admin/subscriptions/statistics`

**Query Parameters**:
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

**Response**:
```json
{
  "trialUsers": 150,
  "paidUsers": 1200,
  "totalUsers": 1350,
  "cancelledUsers": 50,
  "expiredUsers": 100,
  "totalEarnings": 150000.00
}
```

### User Management
**Endpoint**: `GET /api/admin/user-management/user`

**Query Parameters**: 
- `userId` (optional)
- `username` (optional)
- `email` (optional)

**Response**: Complete user object with subscription and activity counts

**Update Role**: `PATCH /api/admin/user-management/user/role`
**Update User**: `PATCH /api/admin/user-management/user`

### Subscription Operations
**Assign**: `POST /api/admin/subscriptions/assign`
**Update**: `PATCH /api/admin/subscriptions/user`
**Cancel**: `DELETE /api/admin/subscriptions/user`
**Get User Subscription**: `GET /api/admin/subscriptions/user`

All endpoints require admin authentication via JWT.

## Frontend UI

### User Search Interface
```
┌─────────────────────────────────────────────────┐
│  User ID  │  Username  │  Email  (Tabbed)      │
├─────────────────────────────────────────────────┤
│  [Search Input]  [Search Button]                │
└─────────────────────────────────────────────────┘
```

### Statistics Dashboard
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Trial Users │ Paid Users  │ Total Users │    Earnings │
│     150     │    1200     │    1350     │  ₹150,000   │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### User Details Card
- Avatar and basic info
- Role badge with update button
- Activity statistics (tests, practice sessions, coins)
- Subscription section with current status
- Quick actions (Edit, Cancel, Assign/Change)

### Dialogs
1. **Assign Subscription**: Choose plan, set duration and status
2. **Edit Subscription**: Update plan, status, or extend duration
3. **Update Role**: Change user role with confirmation

## Workflow

### Search First Approach
1. Admin enters userId, username, or email
2. System fetches complete user profile with subscription
3. Display user details and statistics
4. Admin can then:
   - Assign/update subscription
   - Change role
   - View activity stats
   - Cancel subscription

### Statistics Updates
- Refresh automatically when:
  - Subscription assigned/updated/cancelled
  - User role changed
  - Date filter changed

## Security

- **Admin Only**: All endpoints protected by `authenticate` and `isAdmin` middleware
- **JWT Validation**: Token-based authentication
- **Input Validation**: User identifier validation
- **Soft Deletes**: Cancellations don't delete records for audit

## Benefits

1. **Efficiency**: Find users instantly by any identifier
2. **Visibility**: Real-time statistics and user insights
3. **Control**: Complete subscription and role management
4. **Optimization**: Parallel queries and minimal page loads
5. **UX**: Intuitive search-first interface
6. **Audit**: Complete history through soft deletes

## Database Queries

### Statistics Query (Parallel)
```typescript
const [trialCount, activeCount, cancelledCount, expiredCount, totalRevenue] = 
  await Promise.all([
    prisma.subscription.count({ where: { status: TRIAL } }),
    prisma.subscription.count({ where: { status: ACTIVE } }),
    prisma.subscription.count({ where: { status: CANCELLED } }),
    prisma.subscription.count({ where: { status: EXPIRED } }),
    prisma.subscription.aggregate({ _sum: { amount: true } })
  ])
```

### User Query (Optimized)
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    subscription: { include: { plan: true } },
    _count: {
      select: { testAttempts: true, practiceSessionAttempts: true }
    }
  }
})
```

## File Structure

```
Backend:
├── controllers/
│   ├── subscription/
│   │   ├── adminSubscription.controller.ts
│   │   └── adminUserManagement.controller.ts
│   └── routes/
│       ├── subscription/
│       │   ├── adminSubscription.routes.ts
│       │   └── adminUserManagement.routes.ts

Frontend:
├── app/(admin)/admin/user-subscriptions/
│   └── page.tsx (Complete UI)
├── services/
│   └── subscription.service.ts (All API services)
└── components/admin/
    └── AdminSidebar.tsx (Navigation)
```

## Usage Examples

### Search User
```typescript
// By username
const user = await adminUserManagementService.getUser({ username: "johndoe" })

// By email
const user = await adminUserManagementService.getUser({ email: "john@example.com" })
```

### Assign Subscription
```typescript
await adminSubscriptionService.assignSubscription({
  userId: user.id,
  planId: "premium-plan-id",
  duration: 30,
  status: "ACTIVE"
})
```

### Update Role
```typescript
await adminUserManagementService.updateUserRole({ userId: user.id }, "INSTRUCTOR")
```

### Get Statistics
```typescript
const stats = await adminSubscriptionService.getStatistics({
  startDate: "2024-01-01",
  endDate: "2024-12-31"
})
```

## Future Enhancements

- Bulk operations for multiple users
- Export statistics to CSV/PDF
- Email notifications on subscription changes
- Subscription analytics charts
- User activity timeline
- Advanced filtering and sorting
- Audit log viewer
- Automated subscription renewals

