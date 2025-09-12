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


