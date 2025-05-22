"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pencil, Check, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import ProfileSkeleton from "@/components/skeleton/skel_profile"
import { Checkbox } from "@/components/ui/checkbox"
import { TextFormator } from "@/utils/textFormator"
import { StandardEnum } from "@prisma/client"



type ProfileField = "name" | "username" | "phone" | "standard" | "location" | "avatar" | "studyHoursPerDay" | "targetYear"

interface Profile {
  id: string
  name: string
  username: string
  phone: string
  email: string
  standard: StandardEnum
  location: string 
  avatar: string
  studyHoursPerDay: number  
  targetYear: number 
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().min(10, "Please enter a valid phone number").max(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  standard: z.nativeEnum(StandardEnum),
  location: z.string(), 
  avatar: z.string(),
  studyHoursPerDay: z.coerce.number().min(0).max(24), 
  targetYear: z.coerce.number().int().positive(), 
})

export default function ProfileUpdate() {
  const queryClient = useQueryClient()
  const [editingField, setEditingField] = useState<ProfileField | null>(null)
  const [editValue, setEditValue] = useState<string>("")

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile> => {
      const { data } = await axios.get(`/api/profile/edit`)
      return data
    },
  })

  const mutation = useMutation({
    mutationFn: async ({ field, value }: { field: ProfileField; value: string | number }) => {
      if (field === 'username' && typeof value === 'string') {
        const res = await axios.get(`/api/profile/check-username?username=${value}`)
        if (!res.data.data.available) {
          throw new Error('Username is already taken')
        }
      }

      let processedValue = value
      if (field === 'targetYear' || field === 'studyHoursPerDay') {
        processedValue = Number(value)

        try {
          profileSchema.shape[field].parse(processedValue)
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error(error.errors[0].message)
          }
        }
      }

      await axios.put(`/api/profile/edit`, { [field]: processedValue })
      return { field, value: processedValue }
    },
    onMutate: async ({ field, value }) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] })
      const previousProfile = queryClient.getQueryData<Profile>(["profile"])

      queryClient.setQueryData(["profile"], (old: Profile | undefined) => {
        if (!old) return old

        let processedValue: string | number = value
        if (field === 'targetYear' || field === 'studyHoursPerDay') {
          processedValue = Number(value)
        }

        return {
          ...old,
          [field]: processedValue,
        }
      })

      return { previousProfile }
    },
    onError: (err: Error, _, context) => {
      queryClient.setQueryData(["profile"], context?.previousProfile)
      toast({
        title: "Error",
        description: err.message || "Failed to update profile",
        variant: "destructive"
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      setEditingField(null)
      toast({ title: "Success", description: "Profile updated successfully" })
    },
  })

  const handleEdit = (field: ProfileField) => {
    if (profile) {
      if (field === "email" as string) return;

      let value = profile[field]

      if (typeof value === 'number') {
        value = value.toString()
      }
      setEditValue(value as string || "")
    }
    setEditingField(field)
  }

  const handleSave = (field: ProfileField, value: string) => {
    mutation.mutate({ field, value })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive"
      })
      return
    }

    try {
      const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      const dataUrl = await readFileAsDataURL(file)

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
      }

      const img = await loadImage(dataUrl)

      const size = Math.min(img.width, img.height)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Failed to create canvas context")
      }

      canvas.width = size
      canvas.height = size

      const sx = (img.width - size) / 2
      const sy = (img.height - size) / 2
      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)

      const squareImage = canvas.toDataURL("image/jpeg", 0.9)

      const { data } = await axios.post("/api/cloudinary", {
        image: squareImage
      })

      mutation.mutate({ field: "avatar", value: data.data })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process or upload image",
        variant: "destructive"
      })
    }
  }

  const renderField = (field: ProfileField, label: string) => {
    const isEditing = editingField === field
    const value = profile?.[field]

    const displayValue = typeof value === 'number' ? value.toString() : (value || "")

    return (
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-1 flex-grow">
          <Label htmlFor={field}>{label}</Label>
          <Input
            id={field}
            name={field}
            value={isEditing ? editValue : displayValue}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (isEditing ? handleSave(field, editValue) : handleEdit(field))}
          className="mt-5"
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      </div>
    )
  }

  const currentYear = new Date().getFullYear();
  const targetYears = [currentYear, currentYear + 1, currentYear + 2];

  if (isLoading) return <ProfileSkeleton />

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg  overflow-hidden border border-neutral-200/30">
        <div className="px-5 py-4 border-b border-neutral-200/20 hidden">
          <h3 className="text-lg font-semibold text-gray-800">Profile Settings</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="relative w-28 h-28 mb-4 mx-auto flex items-center justify-center">
                <Avatar className="w-full h-full">
                  <AvatarImage
                    src={profile?.avatar || "/default-avatar.png"}
                    alt={profile?.name}
                    className="object-cover rounded-full border-4 border-white"
                  />
                  <AvatarFallback className="rounded-full text-xl">
                    {profile?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <label
                  htmlFor="avatar"
                  className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>

                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <h4 className="text-md font-medium text-gray-700 mb-4">Account Information</h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                </div>
                {renderField("name", "Full Name")}
                {renderField("username", "Username")}
                {renderField("phone", "Phone Number")}
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-700 mb-4">Study Preferences</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-1 flex-grow">
                    <Label htmlFor="standard">Grade Level</Label>
                    <Select
                      value={profile?.standard || ""}
                      onValueChange={(value) => handleSave("standard", value)}
                      disabled={editingField !== "standard"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select standard" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(StandardEnum).map((standard) => (
                          <SelectItem key={standard} value={standard}>
                            {TextFormator(standard)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (editingField === "standard" ? handleSave("standard", editValue) : handleEdit("standard"))}
                    className="mt-5"
                  >
                    {editingField === "standard" ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-1 flex-grow">
                    <Label htmlFor="targetYear">Target Exam Year</Label>
                    <Select
                      value={profile?.targetYear?.toString() || ""}
                      onValueChange={(value) => handleSave("targetYear", value)}
                      disabled={editingField !== "targetYear"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target year" />
                      </SelectTrigger>
                      <SelectContent>
                        {targetYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (editingField === "targetYear" ? handleSave("targetYear", editValue) : handleEdit("targetYear"))}
                    className="mt-5"
                  >
                    {editingField === "targetYear" ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-1 flex-grow">
                    <Label htmlFor="studyHoursPerDay">Daily Study Hours Target</Label>
                    <Input
                      id="studyHoursPerDay"
                      name="studyHoursPerDay"
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={editingField === "studyHoursPerDay" ? editValue : (profile?.studyHoursPerDay?.toString() || "")}
                      onChange={(e) => setEditValue(e.target.value)}
                      disabled={editingField !== "studyHoursPerDay"}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (editingField === "studyHoursPerDay" ? handleSave("studyHoursPerDay", editValue) : handleEdit("studyHoursPerDay"))}
                    className="mt-5"
                  >
                    {editingField === "studyHoursPerDay" ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-1 flex-grow">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={editingField === "location" ? editValue : (profile?.location || "")}
                      onChange={(e) => setEditValue(e.target.value)}
                      disabled={editingField !== "location"}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (editingField === "location" ? handleSave("location", editValue) : handleEdit("location"))}
                    className="mt-5"
                  >
                    {editingField === "location" ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-700">Notification Preferences</h4>
              <div className="flex items-center text-amber-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Coming Soon</span>
              </div>
            </div>
            <div className="space-y-3 opacity-60">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox id="email-notifications" disabled />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="email-notifications" className="font-medium text-gray-700">Email Notifications</Label>
                  <p className="text-gray-500">Receive test results, reminders, and progress reports via email</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox id="study-reminders" disabled />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="study-reminders" className="font-medium text-gray-700">Study Reminders</Label>
                  <p className="text-gray-500">Get daily reminders to complete your study goals</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox id="performance-updates" disabled />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="performance-updates" className="font-medium text-gray-700">Performance Updates</Label>
                  <p className="text-gray-500">Receive weekly performance analysis and improvement suggestions</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox id="new-content" disabled />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="new-content" className="font-medium text-gray-700">New Content Alerts</Label>
                  <p className="text-gray-500">Be notified when new study materials are added for your subjects</p>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}