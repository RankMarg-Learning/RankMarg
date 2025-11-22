"use client"

import { useState, useEffect } from "react"
import { Button } from "@repo/common-ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/common-ui"
import { Input } from "@repo/common-ui"
import { Label } from "@repo/common-ui"
import { Badge } from "@repo/common-ui"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@repo/common-ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/common-ui"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, User, Mail, Calendar, Crown, DollarSign, Users, TrendingUp, Shield } from "lucide-react"
import { adminSubscriptionService,  AssignSubscriptionData, adminUserManagementService, UserDetails } from "@/services/subscription.service"
import { planService, Plan } from "@/services/subscription.service"

const UserSubscriptionsPage = () => {
  // Search state
  const [searchValue, setSearchValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [foundUser, setFoundUser] = useState<UserDetails | null>(null)

  // Statistics state
  const [statistics, setStatistics] = useState({
    trialUsers: 0,
    paidUsers: 0,
    totalUsers: 0,
    cancelledUsers: 0,
    expiredUsers: 0,
    totalEarnings: 0,
  })
  const [dateFilter, setDateFilter] = useState("all") // all, today, week, month, year

  // Plans
  const [plans, setPlans] = useState<Plan[]>([])
  
  // Dialogs
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  
  // Processing
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  // Forms
  const [assignForm, setAssignForm] = useState<AssignSubscriptionData>({
    userId: "",
    planId: "",
    duration: undefined,
    status: "ACTIVE"
  })
  const [editForm, setEditForm] = useState({
    duration: "",
    status: "",
    planId: ""
  })
  const [roleForm, setRoleForm] = useState({
    role: "USER"
  })

  useEffect(() => {
    fetchPlans()
    fetchStatistics()
  }, [dateFilter])

  const fetchPlans = async () => {
    try {
      const plansData = await planService.getPlans({ status: "active" })
      setPlans(plansData || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const fetchStatistics = async () => {
    try {
      let startDate = ""
      let endDate = ""
      const now = new Date()

      switch (dateFilter) {
        case "today":
          startDate = now.toISOString().split('T')[0]
          endDate = now.toISOString().split('T')[0]
          break
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          startDate = weekAgo.toISOString().split('T')[0]
          endDate = now.toISOString().split('T')[0]
          break
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          startDate = monthAgo.toISOString().split('T')[0]
          endDate = now.toISOString().split('T')[0]
          break
        case "year":
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          startDate = yearAgo.toISOString().split('T')[0]
          endDate = now.toISOString().split('T')[0]
          break
      }

      const stats = await adminSubscriptionService.getStatistics(
        startDate && endDate ? { startDate, endDate } : undefined
      )
      setStatistics(stats)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a search value",
        variant: "destructive"
      })
      return
    }

    setIsSearching(true)
    try {
      const user = await adminUserManagementService.getUser(searchValue)
      setFoundUser(user)
      toast({
        title: "Success",
        description: "User found successfully"
      })
    } catch (error) {
      console.error('Error searching user:', error)
      setFoundUser(null)
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleAssignSubscription = async () => {
    if (!foundUser) return

    setIsProcessing(true)
    try {
      const formData: AssignSubscriptionData = {
        userId: foundUser.id,
      }
      
      if (assignForm.planId) formData.planId = assignForm.planId
      if (assignForm.duration) formData.duration = parseInt(assignForm.duration as any)
      if (assignForm.status) formData.status = assignForm.status

      await adminSubscriptionService.assignSubscription(formData)
      setIsAssignDialogOpen(false)
      resetAssignForm()
      await handleSearch()
      await fetchStatistics()
      toast({
        title: "Success",
        description: "Subscription assigned successfully"
      })
    } catch (error) {
      console.error('Error assigning subscription:', error)
      toast({
        title: "Error",
        description: "Failed to assign subscription",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateSubscription = async () => {
    if (!foundUser) return

    setIsProcessing(true)
    try {
      const updateData: any = {}
      if (editForm.duration) updateData.duration = parseInt(editForm.duration)
      if (editForm.status) updateData.status = editForm.status
      if (editForm.planId) updateData.planId = editForm.planId

      await adminSubscriptionService.updateSubscription({ userId: foundUser.id }, updateData)
      setIsEditDialogOpen(false)
      resetEditForm()
      await handleSearch()
      await fetchStatistics()
      toast({
        title: "Success",
        description: "Subscription updated successfully"
      })
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!foundUser) return
    if (!confirm(`Are you sure you want to cancel ${foundUser.name}'s subscription?`)) {
      return
    }

    try {
      await adminSubscriptionService.cancelSubscription({ userId: foundUser.id })
      await handleSearch()
      await fetchStatistics()
      toast({
        title: "Success",
        description: "Subscription cancelled successfully"
      })
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive"
      })
    }
  }

  const handleUpdateRole = async () => {
    if (!foundUser) return

    setIsProcessing(true)
    try {
      await adminUserManagementService.updateUserRole(foundUser.id, roleForm.role)
      setIsRoleDialogOpen(false)
      setRoleForm({ role: "USER" })
      await handleSearch()
      toast({
        title: "Success",
        description: "User role updated successfully"
      })
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const openEditDialog = () => {
    if (!foundUser?.subscription) return
    setEditForm({
      duration: foundUser.subscription.duration?.toString() || "",
      status: foundUser.subscription.status,
      planId: foundUser.subscription.planId || ""
    })
    setIsEditDialogOpen(true)
  }

  const resetAssignForm = () => {
    setAssignForm({
      userId: "",
      planId: "",
      duration: undefined,
      status: "ACTIVE"
    })
  }

  const resetEditForm = () => {
    setEditForm({
      duration: "",
      status: "",
      planId: ""
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      TRIAL: "secondary",
      CANCELLED: "destructive",
      EXPIRED: "outline",
      PAST_DUE: "outline"
    }
    return variants[status] || "outline"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management & Subscriptions</h1>
          <p className="text-muted-foreground">Manage users and their subscription access</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.trialUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.paidUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.totalEarnings)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter Statistics:</Label>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search User</CardTitle>
          <CardDescription>Search by name, username, email, phone, or location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by name, username, email, phone, location..."
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="mr-2 h-4 w-4" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Details */}
      {foundUser && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {foundUser.avatar ? (
                  <img
                    src={foundUser.avatar}
                    alt={foundUser.name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <CardTitle>{foundUser.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <Mail className="w-4 h-4" />
                    {foundUser.email}
                  </CardDescription>
                  <CardDescription className="mt-1">@{foundUser.username}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Shield className="w-4 h-4 mr-2" />
                      Change Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update User Role</DialogTitle>
                      <DialogDescription>
                        Change the role for {foundUser.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Role</Label>
                        <Select value={roleForm.role} onValueChange={(value) => setRoleForm(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateRole} disabled={isProcessing}>
                        {isProcessing ? "Updating..." : "Update Role"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Stats */}
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant="outline" className="mt-1">{foundUser.role}</Badge>
              </div>
            </div>

            {/* Subscription Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Subscription Details</h3>
                <div className="flex gap-2">
                  {foundUser.subscription?.status !== "CANCELLED" && (
                    <>
                      <Button variant="outline" size="sm" onClick={openEditDialog}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleCancelSubscription}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                  <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        {foundUser.subscription ? "Change" : "Assign"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{foundUser.subscription ? "Change" : "Assign"} Subscription</DialogTitle>
                        <DialogDescription>
                          Assign a subscription to {foundUser.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="planId">Select Plan (Optional)</Label>
                            <Select value={assignForm.planId} onValueChange={(value) => setAssignForm(prev => ({ ...prev, planId: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a plan" />
                              </SelectTrigger>
                              <SelectContent>
                                {plans.map((plan) => (
                                  <SelectItem key={plan.id} value={plan.id}>
                                    {plan.name} - {formatCurrency(plan.amount, plan.currency)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="duration">Duration (Days, Optional)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={assignForm.duration || ""}
                              onChange={(e) => setAssignForm(prev => ({ ...prev, duration: e.target.value as any }))}
                              placeholder="30"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={assignForm.status} onValueChange={(value) => setAssignForm(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="TRIAL">Trial</SelectItem>
                              <SelectItem value="EXPIRED">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAssignSubscription} disabled={isProcessing}>
                          {isProcessing ? "Processing..." : "Assign Subscription"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {foundUser.subscription ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={getStatusBadge(foundUser.subscription.status)} className="mt-1">
                      {foundUser.subscription.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan</p>
                    <p className="text-lg font-semibold">
                      {foundUser.subscription.plan?.name || "No Plan"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">End Date</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {foundUser.subscription.currentPeriodEnd 
                        ? formatDate(foundUser.subscription.currentPeriodEnd)
                        : "No end date"
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">No subscription assigned</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update {foundUser?.name}'s subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-planId">Plan</Label>
                <Select value={editForm.planId} onValueChange={(value) => setEditForm(prev => ({ ...prev, planId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-duration">Duration (Days to Add)</Label>
              <Input
                id="edit-duration"
                type="number"
                value={editForm.duration}
                onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubscription} disabled={isProcessing}>
              {isProcessing ? "Updating..." : "Update Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserSubscriptionsPage
