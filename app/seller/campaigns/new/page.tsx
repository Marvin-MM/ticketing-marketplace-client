"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import type { z } from "zod"
import { ArrowLeft, Plus, X, Calendar, MapPin, Ticket } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { campaignsApi } from "@/lib/api/campaigns"
import { campaignSchema } from "@/lib/validations"

type CampaignFormData = z.infer<typeof campaignSchema>

export default function NewCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [ticketTypes, setTicketTypes] = useState<Array<{ name: string; price: number; quantity: number }>>([
    { name: "", price: 0, quantity: 0 },
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      eventType: "concert",
      status: "draft",
    },
  })

  const createMutation = useMutation({
    mutationFn: campaignsApi.create,
    onSuccess: () => {
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully.",
      })
      router.push("/campaigns")
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create campaign",
        variant: "destructive",
      })
    },
  })

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: "", price: 0, quantity: 0 }])
  }

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index))
    }
  }

  const updateTicketType = (index: number, field: string, value: string | number) => {
    const updated = [...ticketTypes]
    updated[index] = { ...updated[index], [field]: value }
    setTicketTypes(updated)
  }

  const onSubmit = (data: CampaignFormData) => {
    const payload = {
      ...data,
      ticketTypes: ticketTypes.filter((t) => t.name && t.price > 0 && t.quantity > 0),
    }
    createMutation.mutate(payload)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create New Campaign</h1>
          <p className="text-white/60">Set up your event and start selling tickets</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6 bg-white/5 border-white/10">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Summer Music Festival 2024"
                  className="bg-black border-white/10"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your event..."
                  rows={4}
                  className="bg-black border-white/10"
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select onValueChange={(value) => setValue("eventType", value)} defaultValue="concert">
                    <SelectTrigger className="bg-black border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concert">Concert</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="theater">Theater</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setValue("status", value)} defaultValue="draft">
                    <SelectTrigger className="bg-black border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Event Details */}
          <Card className="p-6 bg-white/5 border-white/10">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...register("startDate")}
                    className="bg-black border-white/10"
                  />
                  {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>}
                </div>

                <div>
                  <Label htmlFor="endDate">End Date & Time *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register("endDate")}
                    className="bg-black border-white/10"
                  />
                  {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="Venue name and address"
                    className="bg-black border-white/10 pl-10"
                  />
                </div>
                {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <Label htmlFor="imageUrl">Event Image URL</Label>
                <Input
                  id="imageUrl"
                  {...register("imageUrl")}
                  placeholder="https://example.com/image.jpg"
                  className="bg-black border-white/10"
                />
              </div>
            </div>
          </Card>

          {/* Ticket Types */}
          <Card className="p-6 bg-white/5 border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Ticket Types
              </h2>
              <Button type="button" onClick={addTicketType} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Ticket Type
              </Button>
            </div>

            <div className="space-y-4">
              {ticketTypes.map((ticket, index) => (
                <div key={index} className="p-4 bg-black/50 border border-white/10 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <Label>Ticket Name</Label>
                        <Input
                          value={ticket.name}
                          onChange={(e) => updateTicketType(index, "name", e.target.value)}
                          placeholder="VIP, General, Early Bird"
                          className="bg-black border-white/10"
                        />
                      </div>
                      <div>
                        <Label>Price (KES)</Label>
                        <Input
                          type="number"
                          value={ticket.price || ""}
                          onChange={(e) => updateTicketType(index, "price", Number.parseFloat(e.target.value) || 0)}
                          placeholder="1000"
                          className="bg-black border-white/10"
                        />
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={ticket.quantity || ""}
                          onChange={(e) => updateTicketType(index, "quantity", Number.parseInt(e.target.value) || 0)}
                          placeholder="100"
                          className="bg-black border-white/10"
                        />
                      </div>
                    </div>
                    {ticketTypes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTicketType(index)}
                        className="mt-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/campaigns">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
