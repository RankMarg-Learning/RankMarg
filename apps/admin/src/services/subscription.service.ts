import  api  from '@/utils/api'

// Plan types
export interface Plan {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  duration: number
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePlanData {
  name: string
  description: string
  amount: string
  currency: string
  duration: string
  features: string[]
  isActive: boolean
}

export interface UpdatePlanData extends CreatePlanData {
  id: string
}

// PromoCode types
export interface PromoCode {
  id: string
  code: string
  description: string
  discount: number
  maxUsageCount: number | null
  currentUsageCount: number
  validFrom: string
  validUntil: string
  isActive: boolean
  applicablePlans: Plan[] // Changed from string[] to Plan[] to match backend response
  createdAt: string
  updatedAt: string
}

export interface CreatePromoCodeData {
  code: string
  description: string
  discount: string
  maxUsageCount: string
  validFrom: string
  validUntil: string
  isActive: boolean
  applicablePlans: string[]
}

export interface UpdatePromoCodeData extends CreatePromoCodeData {
  id: string
}

// Analytics types
export interface AnalyticsData {
  totalSubscriptions: number
  activeSubscriptions: number
  trialSubscriptions: number
  totalRevenue: number
  monthlyRecurringRevenue: number
  averageRevenuePerUser: number
  conversionRate: number
  churnRate: number
  planDistribution: PlanDistribution[]
  revenueTrend: RevenueTrend[]
  subscriptionGrowth: SubscriptionGrowth[]
  topPlans: TopPlan[]
  recentSubscriptions: RecentSubscription[]
}

export interface PlanDistribution {
  planName: string
  count: number
  percentage: number
  revenue: number
}

export interface RevenueTrend {
  month: string
  revenue: number
  subscriptions: number
}

export interface SubscriptionGrowth {
  month: string
  newSubscriptions: number
  cancellations: number
  netGrowth: number
}

export interface TopPlan {
  planName: string
  subscribers: number
  revenue: number
  growth: number
}

export interface RecentSubscription {
  id: string
  userName: string
  planName: string
  amount: number
  status: string
  date: string
}

// Plan API functions
export const planService = {
  // Get all plans
  async getPlans(params?: { status?: string; search?: string }): Promise<Plan[]> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)
    
    const response = await api.get(`/plans?${searchParams.toString()}`)
    return response.data.data || []
  },

  // Get plan by ID
  async getPlan(id: string): Promise<Plan> {
    const response = await api.get(`/plans/${id}`)
    return response.data.data
  },

  // Create new plan
  async createPlan(data: CreatePlanData): Promise<Plan> {
    const response = await api.post('/plans', data)
    return response.data.data
  },

  // Update plan
  async updatePlan(data: UpdatePlanData): Promise<Plan> {
    const response = await api.put(`/plans/${data.id}`, data)
    return response.data.data
  },

  // Delete plan
  async deletePlan(id: string): Promise<void> {
    await api.delete(`/plans/${id}`)
  },

  // Toggle plan status
  async togglePlanStatus(id: string, isActive: boolean): Promise<Plan> {
    const response = await api.patch(`/plans/${id}`, { isActive })
    return response.data.data
  }
}

// PromoCode API functions
export const promoCodeService = {
  // Get all promocodes
  async getPromoCodes(params?: { status?: string; search?: string }): Promise<PromoCode[]> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)
    
    const response = await api.get(`/promocodes?${searchParams.toString()}`)
    return response.data.data || []
  },

  // Get promocode by ID
  async getPromoCode(id: string): Promise<PromoCode> {
    const response = await api.get(`/promocodes/${id}`)
    return response.data.data
  },

  // Create new promocode
  async createPromoCode(data: CreatePromoCodeData): Promise<PromoCode> {
    const response = await api.post('/promocodes', data)
    return response.data.data
  },

  // Update promocode
  async updatePromoCode(data: UpdatePromoCodeData): Promise<PromoCode> {
    const response = await api.put(`/promocodes/${data.id}`, data)
    return response.data.data
  },

  // Delete promocode
  async deletePromoCode(id: string): Promise<void> {
    await api.delete(`/promocodes/${id}`)
  },

  // Toggle promocode status
  async togglePromoCodeStatus(id: string, isActive: boolean): Promise<PromoCode> {
    const response = await api.patch(`/promocodes/${id}`, { isActive })
    return response.data.data
  }
}

// Admin Subscription types
export interface SubscriptionDetails {
  id: string
  userId: string
  planId: string | null
  duration: number | null
  status: string
  provider: string
  providerId: string | null
  amount: number
  discountApplied: number | null
  promoCodeUsed: string | null
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    username: string
    avatar: string | null
  }
  plan: {
    id: string
    name: string
    description: string
    amount: number
    currency: string
    duration: number
    features: string[]
    isActive: boolean
    createdAt: string
    updatedAt: string
  } | null
}

export interface AssignSubscriptionData {
  userId?: string
  username?: string
  email?: string
  planId?: string
  duration?: number
  status?: string
}

export interface UpdateSubscriptionData {
  status?: string
  duration?: number
  planId?: string
}

export interface SubscriptionsResponse {
  subscriptions: SubscriptionDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Admin Subscription API functions
export const adminSubscriptionService = {
  // Assign subscription to user
  async assignSubscription(data: AssignSubscriptionData): Promise<SubscriptionDetails> {
    const response = await api.post('/admin/subscriptions/assign', data)
    return response.data.data
  },

  // Get all subscriptions
  async getSubscriptions(params?: {
    status?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<SubscriptionsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    const response = await api.get(`/admin/subscriptions?${searchParams.toString()}`)
    return response.data.data
  },

  // Get specific user's subscription
  async getUserSubscription(params: {
    userId?: string
    username?: string
    email?: string
  }): Promise<SubscriptionDetails> {
    const searchParams = new URLSearchParams()
    if (params.userId) searchParams.append('userId', params.userId)
    if (params.username) searchParams.append('username', params.username)
    if (params.email) searchParams.append('email', params.email)
    
    const response = await api.get(`/admin/subscriptions/user?${searchParams.toString()}`)
    return response.data.data
  },

  // Update subscription
  async updateSubscription(
    identifier: { userId?: string; username?: string; email?: string },
    data: UpdateSubscriptionData
  ): Promise<SubscriptionDetails> {
    const searchParams = new URLSearchParams()
    if (identifier.userId) searchParams.append('userId', identifier.userId)
    if (identifier.username) searchParams.append('username', identifier.username)
    if (identifier.email) searchParams.append('email', identifier.email)
    
    const response = await api.patch(`/admin/subscriptions/user?${searchParams.toString()}`, data)
    return response.data.data
  },

  // Cancel subscription
  async cancelSubscription(identifier: {
    userId?: string
    username?: string
    email?: string
  }): Promise<SubscriptionDetails> {
    const searchParams = new URLSearchParams()
    if (identifier.userId) searchParams.append('userId', identifier.userId)
    if (identifier.username) searchParams.append('username', identifier.username)
    if (identifier.email) searchParams.append('email', identifier.email)
    
    const response = await api.delete(`/admin/subscriptions/user?${searchParams.toString()}`)
    return response.data.data
  },

  // Get statistics
  async getStatistics(params?: {
    startDate?: string
    endDate?: string
  }): Promise<{
    trialUsers: number
    paidUsers: number
    totalUsers: number
    cancelledUsers: number
    expiredUsers: number
    totalEarnings: number
  }> {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)
    
    const response = await api.get(`/admin/subscriptions/statistics?${searchParams.toString()}`)
    return response.data.data
  }
}

// User Management types
export interface UserDetails {
  id: string
  name: string
  email: string
  username: string
  avatar: string | null
  phone: string | null
  role: string
  subscription: {
    id: string
    userId: string
    planId: string | null
    duration: number | null
    status: string
    provider: string
    amount: number
    currentPeriodEnd: string | null
    createdAt: string
    updatedAt: string
    plan: {
      id: string
      name: string
      description: string
      amount: number
      currency: string
      duration: number
    } | null
  } | null
}

// User Management API functions
export const adminUserManagementService = {
  // Get all users with pagination
  async getAllUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }): Promise<{
    users: UserDetails[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.role) searchParams.append('role', params.role)
    
    const response = await api.get(`/admin/user-management/users?${searchParams.toString()}`)
    return response.data.data
  },

  // Get user details by unified search
  async getUser(search: string): Promise<UserDetails> {
    const response = await api.get(`/admin/user-management/user?search=${encodeURIComponent(search)}`)
    return response.data.data
  },

  // Create new user
  async createUser(data: {
    fullname: string
    username: string
    email: string
    password: string
    role?: string
  }): Promise<UserDetails> {
    const response = await api.post('/admin/user-management/user', data)
    return response.data.data
  },

  // Update user role
  async updateUserRole(userId: string, role: string): Promise<Partial<UserDetails>> {
    const response = await api.patch(`/admin/user-management/user/role?userId=${userId}`, { role })
    return response.data.data
  },

  // Update user details
  async updateUser(userId: string, data: Partial<UserDetails>): Promise<UserDetails> {
    const response = await api.patch(`/admin/user-management/user?userId=${userId}`, data)
    return response.data.data
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/user-management/user?userId=${userId}`)
  }
}


