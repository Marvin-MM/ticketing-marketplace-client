"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Plus, 
  Mail, 
  Phone, 
  MoreVertical, 
  Trash2, 
  Shield, 
  Loader2, 
  UserCheck, 
  UserX, 
  Clock,
  AlertCircle,
  Check,
  X,
  Key
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { formatDate, formatRelativeTime } from "@/lib/utils/format"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Permission options
const PERMISSION_OPTIONS = [
  { id: 'manage_campaigns', label: 'Manage Campaigns', description: 'Validates and approves campaign tickets' },
  { id: 'view_analytics', label: 'View Analytics', description: 'Access assigned campaign performance data' },
]

export default function ManagersPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [selectedManager, setSelectedManager] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    permissions: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch managers
  const { 
    data: managerData, 
    isLoading: isLoadingManagers,
    error: managersError 
  } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const data = await authApi.getSellerManagers()
      return data
    },
    retry: 2,
    refetchOnWindowFocus: false,
  })

  const managers = managerData?.managers || []

  // Create manager mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return authApi.createManager({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        permissions: data.permissions,
      })
    },
    onSuccess: (data) => {
      toast({
        title: "Invitation Sent",
        description: `Manager invitation sent to ${data.email}. They have 24 hours to accept.`,
      })
      setDialogOpen(false)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ["managers"] })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create manager",
        description: error.message || "An error occurred while creating the manager",
        variant: "destructive",
      })
    },
  })

  // Deactivate manager mutation
  const deactivateMutation = useMutation({
    mutationFn: async (managerId: string) => {
      return authApi.deactivateManager(managerId)
    },
    onSuccess: (data) => {
      toast({
        title: "Manager Deactivated",
        description: "Manager has been deactivated successfully.",
      })
      setDeactivateDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ["managers"] })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to deactivate manager",
        description: error.message || "An error occurred while deactivating the manager",
        variant: "destructive",
      })
    },
  })

  // Form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      permissions: [],
    })
  }

  const handleDeactivate = () => {
    if (selectedManager) {
      deactivateMutation.mutate(selectedManager.id)
    }
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
            <Check className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case 'PENDING_INVITE':
        return (
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'INVITE_EXPIRED':
        return (
          <Badge variant="outline" className="border-red-500/50 text-red-500">
            <X className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-gray-500/50 text-gray-500">
            <UserX className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        )
    }
  }

  // Permission chip component
  const PermissionChip = ({ permission }: { permission: string }) => {
    const permissionOption = PERMISSION_OPTIONS.find(p => p.id === permission)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="text-xs cursor-help">
              <Key className="h-3 w-3 mr-1" />
              {permissionOption?.label || permission}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{permissionOption?.description || 'No description available'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (isLoadingManagers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading managers...</p>
        </div>
      </div>
    )
  }

  if (managersError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load managers. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Team Managers</h1>
          <p className="text-muted-foreground">
            Manage team members and their access permissions
            {managers.length > 0 && ` • ${managers.length} ${managers.length === 1 ? 'member' : 'members'}`}
          </p>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Invite Manager
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Invite New Manager</DialogTitle>
                    <DialogDescription>
                      Invite a team member to help manage your campaigns. They'll receive an email invitation.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold">Permissions</Label>
                        <p className="text-sm text-muted-foreground">
                          Select what this manager can access and manage
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        {PERMISSION_OPTIONS.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                            <div className="space-y-1">
                              <div className="font-medium">{permission.label}</div>
                              <div className="text-sm text-muted-foreground">{permission.description}</div>
                            </div>
                            <Switch
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)}
                        disabled={createMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending Invitation...
                          </>
                        ) : (
                          "Send Invitation"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </TooltipTrigger>
            <TooltipContent>
              <p>Managers will receive an email invitation to join your team</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Total Managers</div>
            <div className="text-3xl font-bold">{managers.length}</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-3xl font-bold">
              {managers.filter(m => m.status === 'ACTIVE').length}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-3xl font-bold">
              {managers.filter(m => m.status === 'PENDING_INVITE').length}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Permissions Used</div>
            <div className="text-3xl font-bold">
              {Array.from(new Set(managers.flatMap(m => m.permissions))).length}
            </div>
          </div>
        </Card>
      </div>

      {/* Managers List */}
      {managers.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No managers yet</h3>
          <p className="text-muted-foreground mb-6">
            Invite team members to help manage your campaigns and operations
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Invite Your First Manager
          </Button>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {managers.map((manager) => (
              <Card key={manager.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg truncate">{manager.name}</h3>
                        <StatusBadge status={manager.status} />
                        {manager.isActive && manager.lastActiveAt && (
                          <span className="text-xs text-muted-foreground">
                            Last active {formatRelativeTime(manager.lastActiveAt)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {manager.email}
                        </span>
                        {manager.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {manager.phone}
                          </span>
                        )}
                      </div>
                      
                      {/* Permissions */}
                      {manager.permissions.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Permissions</div>
                          <div className="flex flex-wrap gap-2">
                            {manager.permissions.map((permission) => (
                              <PermissionChip key={permission} permission={permission} />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-3">
                        Added {formatDate(manager.createdAt)}
                        {manager.invitationExpiry && manager.status === 'PENDING_INVITE' && (
                          <span className="ml-2">
                            • Invitation expires {formatRelativeTime(manager.invitationExpiry)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {manager.isActive && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedManager(manager)
                            setDeactivateDialogOpen(true)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Deactivate Manager
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Manager</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {selectedManager?.name}? They will lose access to manage campaigns.
              {selectedManager?.status === 'PENDING_INVITE' && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This manager hasn't accepted their invitation yet. Deactivating will cancel the invitation.
                  </AlertDescription>
                </Alert>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeactivate} 
              disabled={deactivateMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate Manager"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}