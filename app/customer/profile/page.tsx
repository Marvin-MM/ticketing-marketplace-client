"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { User, Mail, Phone, Lock, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/useAuth"

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true)
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({ title: "Profile updated successfully" })
    } catch (error) {
      toast({ title: "Failed to update profile", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdating(true)
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({ title: "Password updated successfully" })
      reset()
    } catch (error) {
      toast({ title: "Failed to update password", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : "U"

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.profilePicture} alt={user?.firstName} />
            <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <Button variant="outline" size="sm" className="mt-2 bg-transparent">
              Change Photo
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="firstName" {...registerProfile("firstName")} className="pl-10" />
                  </div>
                  {profileErrors.firstName && (
                    <p className="text-sm text-destructive mt-1">{profileErrors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="lastName" {...registerProfile("lastName")} className="pl-10" />
                  </div>
                  {profileErrors.lastName && (
                    <p className="text-sm text-destructive mt-1">{profileErrors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" {...registerProfile("email")} className="pl-10" />
                </div>
                {profileErrors.email && <p className="text-sm text-destructive mt-1">{profileErrors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" {...registerProfile("phone")} className="pl-10" />
                </div>
                {profileErrors.phone && <p className="text-sm text-destructive mt-1">{profileErrors.phone.message}</p>}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="password">
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type="password"
                    {...registerPassword("currentPassword")}
                    className="pl-10"
                  />
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive mt-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="newPassword" type="password" {...registerPassword("newPassword")} className="pl-10" />
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerPassword("confirmPassword")}
                    className="pl-10"
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
