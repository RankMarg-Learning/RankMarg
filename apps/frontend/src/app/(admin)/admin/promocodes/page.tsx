"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Copy, Search, Filter, MoreHorizontal, Calendar, Percent, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { promoCodeService, planService, PromoCode, CreatePromoCodeData, Plan } from "@/services/subscription.service"

const PromoCodesPage = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [filteredPromoCodes, setFilteredPromoCodes] = useState<PromoCode[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const { toast } = useToast()

  // Plans data for applicable plans selection
  const [plans, setPlans] = useState<Plan[]>([])

  // Form state
  const [formData, setFormData] = useState<CreatePromoCodeData>({
    code: "",
    description: "",
    discount: "",
    maxUsageCount: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
    applicablePlans: []
  })

  // Fetch data on component mount
  useEffect(() => {
    fetchPromoCodes()
    fetchPlans()
  }, [])

  const fetchPromoCodes = async () => {
    try {
      setIsInitialLoading(true)
      const data = await promoCodeService.getPromoCodes()
      // Ensure data is always an array
      const promoCodesArray = Array.isArray(data) ? data : []
      setPromoCodes(promoCodesArray)
      setFilteredPromoCodes(promoCodesArray)
    } catch (error) {
      console.error('Error fetching promocodes:', error)
      // Set empty arrays on error to prevent map errors
      setPromoCodes([])
      setFilteredPromoCodes([])
      toast({
        title: "Error",
        description: "Failed to fetch promocodes",
        variant: "destructive"
      })
    } finally {
      setIsInitialLoading(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const data = await planService.getPlans()
      // Ensure data is always an array
      const plansArray = Array.isArray(data) ? data : []
      setPlans(plansArray)
    } catch (error) {
      console.error('Error fetching plans:', error)
      // Set empty array on error to prevent map errors
      setPlans([])
    }
  }

  // Filter promocodes based on search and status
  useEffect(() => {
    let filtered = promoCodes

    if (searchTerm) {
      filtered = filtered.filter(promo =>
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(promo =>
        statusFilter === "active" ? promo.isActive : !promo.isActive
      )
    }

    setFilteredPromoCodes(filtered)
  }, [promoCodes, searchTerm, statusFilter])

  const handleCreatePromoCode = async () => {
    if (!formData.code || !formData.discount || !formData.validFrom || !formData.validUntil) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      toast({
        title: "Validation Error",
        description: "Valid until date must be after valid from date",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const newPromoCode = await promoCodeService.createPromoCode(formData)
      setPromoCodes(prev => [newPromoCode, ...prev])
      setIsCreateDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "Promo code created successfully"
      })
    } catch (error) {
      console.error('Error creating promocode:', error)
      toast({
        title: "Error",
        description: "Failed to create promo code",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditPromoCode = async () => {
    if (!editingPromoCode || !formData.code || !formData.discount || !formData.validFrom || !formData.validUntil) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      toast({
        title: "Validation Error",
        description: "Valid until date must be after valid from date",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const updatedPromoCode = await promoCodeService.updatePromoCode({
        ...formData,
        id: editingPromoCode.id
      })
      setPromoCodes(prev => prev.map(promo => promo.id === editingPromoCode.id ? updatedPromoCode : promo))
      setIsEditDialogOpen(false)
      setEditingPromoCode(null)
      resetForm()
      toast({
        title: "Success",
        description: "Promo code updated successfully"
      })
    } catch (error) {
      console.error('Error updating promocode:', error)
      toast({
        title: "Error",
        description: "Failed to update promo code",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePromoCode = async (promoId: string) => {
    if (confirm("Are you sure you want to delete this promo code?")) {
      try {
        await promoCodeService.deletePromoCode(promoId)
        setPromoCodes(prev => prev.filter(promo => promo.id !== promoId))
        toast({
          title: "Success",
          description: "Promo code deleted successfully"
        })
      } catch (error) {
        console.error('Error deleting promocode:', error)
        toast({
          title: "Error",
          description: "Failed to delete promo code",
          variant: "destructive"
        })
      }
    }
  }

  const handleToggleStatus = async (promoId: string) => {
    try {
      const promoCode = promoCodes.find(p => p.id === promoId)
      if (!promoCode) return

      const updatedPromoCode = await promoCodeService.togglePromoCodeStatus(promoId, !promoCode.isActive)
      setPromoCodes(prev => prev.map(promo => promo.id === promoId ? updatedPromoCode : promo))
      toast({
        title: "Success",
        description: "Promo code status updated successfully"
      })
    } catch (error) {
      console.error('Error updating promocode status:', error)
      toast({
        title: "Error",
        description: "Failed to update promo code status",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount: "",
      maxUsageCount: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
      applicablePlans: []
    })
  }

  const openEditDialog = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode)
    setFormData({
      code: promoCode.code,
      description: promoCode.description,
      discount: promoCode.discount.toString(),
      maxUsageCount: promoCode.maxUsageCount?.toString() || "",
      validFrom: promoCode.validFrom,
      validUntil: promoCode.validUntil,
      isActive: promoCode.isActive,
      applicablePlans: promoCode.applicablePlans.map(plan => plan.id)
    })
    setIsEditDialogOpen(true)
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied!",
      description: "Promo code copied to clipboard"
    })
  }

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  const isUsageLimitReached = (promoCode: PromoCode) => {
    return promoCode.maxUsageCount !== null && promoCode.currentUsageCount >= promoCode.maxUsageCount
  }

  const getStatusBadge = (promoCode: PromoCode) => {
    if (!promoCode.isActive) return { variant: "secondary" as const, text: "Inactive" }
    if (isExpired(promoCode.validUntil)) return { variant: "destructive" as const, text: "Expired" }
    if (isUsageLimitReached(promoCode)) return { variant: "destructive" as const, text: "Limit Reached" }
    return { variant: "default" as const, text: "Active" }
  }

  const getApplicablePlansText = (planIds: string[]) => {
    if (planIds.length === 0) return "All Plans"
    return planIds.map(id => plans.find(p => p.id === id)?.name).filter(Boolean).join(", ")
  }

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
            <p className="text-muted-foreground">
              Manage promotional codes and discounts for your platform
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
          <p className="text-muted-foreground">
            Manage promotional codes and discounts for your platform
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Promo Code</DialogTitle>
              <DialogDescription>
                Add a new promotional code with discount and validity
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Promo Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., WELCOME20"
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount (%) *</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                    placeholder="20"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the promo code..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="maxUsageCount">Maximum Usage Count</Label>
                <Input
                  id="maxUsageCount"
                  type="number"
                  min="1"
                  value={formData.maxUsageCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxUsageCount: e.target.value }))}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div>
                <Label>Applicable Plans</Label>
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <div key={plan.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`plan-${plan.id}`}
                        checked={formData.applicablePlans.includes(plan.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              applicablePlans: [...prev.applicablePlans, plan.id]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              applicablePlans: prev.applicablePlans.filter(id => id !== plan.id)
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={`plan-${plan.id}`}>{plan.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active Promo Code</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePromoCode} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Promo Code"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search promo codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Promo Codes</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Promo Codes Table */}
      {filteredPromoCodes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No promo codes found. Create your first promo code to get started.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Promo Codes</CardTitle>
            <CardDescription>
              Manage all promotional codes and their usage statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Plans</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromoCodes.map((promoCode) => {
                  const status = getStatusBadge(promoCode)
                  return (
                    <TableRow key={promoCode.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {promoCode.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(promoCode.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm font-medium">{promoCode.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          <Percent className="mr-1 h-3 w-3" />
                          {promoCode.discount}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {promoCode.currentUsageCount}
                            {promoCode.maxUsageCount && (
                              <span className="text-muted-foreground">
                                / {promoCode.maxUsageCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(promoCode.validFrom).toLocaleDateString()} - {new Date(promoCode.validUntil).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-32">
                          {getApplicablePlansText(promoCode.applicablePlans.map(plan => plan.id))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(promoCode)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(promoCode.id)}>
                              {promoCode.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePromoCode(promoCode.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
            <DialogDescription>
              Update the promotional code details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-code">Promo Code *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., WELCOME20"
                />
              </div>
              <div>
                <Label htmlFor="edit-discount">Discount (%) *</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                  placeholder="20"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the promo code..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-validFrom">Valid From *</Label>
                <Input
                  id="edit-validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-validUntil">Valid Until *</Label>
                <Input
                  id="edit-validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-maxUsageCount">Maximum Usage Count</Label>
              <Input
                id="edit-maxUsageCount"
                type="number"
                min="1"
                value={formData.maxUsageCount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUsageCount: e.target.value }))}
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div>
              <Label>Applicable Plans</Label>
              <div className="space-y-2">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-plan-${plan.id}`}
                      checked={formData.applicablePlans.includes(plan.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            applicablePlans: [...prev.applicablePlans, plan.id]
                          }))
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            applicablePlans: prev.applicablePlans.filter(id => id !== plan.id)
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={`edit-plan-${plan.id}`}>{plan.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="edit-isActive">Active Promo Code</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPromoCode} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Promo Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PromoCodesPage
