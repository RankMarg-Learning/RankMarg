"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import ProfileSkeleton from "@/components/skeleton/skel_profile"

type ProfileField = "name" | "username" | "phone" | "standard" | "Location" | "avatar"

interface Profile {
  id: string
  name: string
  username: string
  phone: string
  standard: string
  Location: string
  avatar: string
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().min(10, "Please enter a valid phone number").max(10,"Please enter a valid phone number"),
  standard: z.string(),
  Location: z.string(),
  avatar: z.string(),
})

export default function ProfileUpdate() {


  const fetchProfile = async (): Promise<Profile> => {
    const { data } = await axios.get(`/api/profile/edit`)
    return data
  }
  const updateProfileField = async (update: { field: ProfileField; value: string }) => {
    const { field, value } = update
    
    if (field === 'username') {
      const { data: isAvailable } = await axios.get(`/api/profile/check-username?username=${value}`)
      if (!isAvailable) {
        throw new Error('Username is already taken')
      }
    }

    try {
      profileSchema.shape[field].parse(value)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message)
      }
    }

    await axios.put(`/api/profile/edit`, { [field]: value })
  }

  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  })

  const mutation = useMutation({
    mutationFn: updateProfileField,
    onMutate: async ({ field, value }) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] })
      const previousProfile = queryClient.getQueryData<Profile>(["profile"])
      queryClient.setQueryData(["profile"], (old: Profile | undefined) => ({
        ...old,
        [field]: value,
      }))
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
      toast({ title: "Success", description: "Profile updated successfully" })
    },
  })

  

  const [editingField, setEditingField] = useState<ProfileField | null>(null)
  const [editValue, setEditValue] = useState<string>("")

  const handleEdit = (field: ProfileField) => {
    setEditingField(field)
    setEditValue(profile?.[field] || "")
  }

  const handleSave = async (field: ProfileField, value: string) => {
    try {
      try {
        profileSchema.shape[field].parse(value)
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({ 
            title: "Validation Error", 
            description: error.errors[0].message, 
            variant: "destructive" 
          })
          return
        }
      }
      
      await mutation.mutate({ field, value })
      setEditingField(null)
    } catch (error) {
      if (error instanceof Error) {
        toast({ 
          title: "Error", 
          description: error.message, 
          variant: "destructive" 
        })
      }
      setEditingField(null)
    }
  }

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target
  //   setProfile((prev) => ({ ...prev, [name]: value }))
  // }

  // const handleStandardChange = (value: string) => {
  //   setProfile((prev) => ({ ...prev, standard: value }))
  // }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        })
        return
      }
  
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please upload an image file",
          variant: "destructive"
        })
        return
      }
  
      const reader = new FileReader()
      reader.onloadend = async () => {
        const img = new Image()
        img.src = reader.result as string
        img.onload = async () => {
          const size = Math.min(img.width, img.height) // Take the smallest dimension
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
  
          if (!ctx) {
            toast({
              title: "Error",
              description: "Failed to process image",
              variant: "destructive"
            })
            return
          }
  
          // Set canvas to square size
          canvas.width = size
          canvas.height = size
  
          // Crop and draw the image to canvas
          const sx = (img.width - size) / 2
          const sy = (img.height - size) / 2
          ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)
  
          const squareImage = canvas.toDataURL("image/jpeg", 0.9) // Convert to JPEG with high quality
  
          try {
            // Upload square image to Cloudinary
            const { data } = await axios.post("/api/cloudinary", {
              image: squareImage
            })
  
            // Update profile with Cloudinary URL
            mutation.mutate({ field: "avatar", value: data.url })
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to upload image",
              variant: "destructive"
            })
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }
  

  const renderField = (field: ProfileField, label: string) => {
    const isEditing = editingField === field
    return (
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-1 flex-grow">
          <Label htmlFor={field}>{label}</Label>
          {field === "standard" ? (
            <Select
              value={profile?.standard || ""}
              onValueChange={(value) => handleSave(field, value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select standard" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(5)].map((_, i) => (
                  <SelectItem key={i} value={(i + 9).toString()}>
                    {i + 9}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field}
              name={field}
              value={isEditing ? editValue : (profile?.[field] || "")}
              onChange={(e) => setEditValue(e.target.value)}
              disabled={!isEditing}
            />
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => (isEditing ? handleSave(field, editValue) : handleEdit(field)) }
          className="mt-5"
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      </div>
    )
  }

  if (isLoading) return <ProfileSkeleton/>

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle className="flex justify-center">Update Profile </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center space-x-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile?.avatar} alt={profile?.name} />
            <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer text-sm font-medium text-yellow-600 hover:text-yellow-500">
              Change Avatar
            </Label>
            <Input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>
        {renderField("name", "Name")}
        {renderField("username", "Username")}
        {renderField("phone", "Phone")}
        {renderField("standard", "Standard")}
        {renderField("Location", "Location")}
      </CardContent>
    </Card>
  )
}