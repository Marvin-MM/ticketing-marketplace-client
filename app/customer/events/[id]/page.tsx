"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { campaignsApi } from "@/lib/api/campaigns"
import { bookingsApi } from "@/lib/api/bookings"
import { paymentsApi } from "@/lib/api/payments"
import { queryKeys } from "@/lib/queryClient"
import { useBookingStore } from "@/lib/store/bookingStore"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Users, Ticket, Share2, Loader2, Minus, Plus } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils/format"
import type { IssuanceType } from "@/lib/types"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { setBookingDetails } = useBookingStore()

  const [selectedTicketType, setSelectedTicketType] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [issuanceType, setIssuanceType] = useState<IssuanceType>("SINGLE")
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)

  const { data: campaign, isLoading } = useQuery({
    queryKey: queryKeys.campaigns.detail(params.id as string),
    queryFn: () => campaignsApi.getCampaignById(params.id as string),
    enabled: !!params.id,
  })

  const createBookingMutation = useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: async (booking) => {
      // Initialize payment
      try {
        const payment = await paymentsApi.initializePayment({
          bookingId: booking.id,
          currency: "UGX",
        })

        toast({
          title: "Booking created!",
          description: "Redirecting to payment...",
        })

        // Redirect to payment link
        window.location.href = payment.paymentLink
      } catch (error: any) {
        toast({
          title: "Payment initialization failed",
          description: error.message,
          variant: "destructive",
        })
      }
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleBooking = () => {
    if (!selectedTicketType) {
      toast({
        title: "Select a ticket type",
        description: "Please choose a ticket type to continue",
        variant: "destructive",
      })
      return
    }

    const ticketTypeData = campaign?.ticketTypes[selectedTicketType]
    if (!ticketTypeData) return

    createBookingMutation.mutate({
      campaignId: campaign!.id,
      ticketType: selectedTicketType,
      quantity,
      issuanceType,
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title,
          text: campaign?.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Event link copied to clipboard",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Event not found</h3>
          <p className="text-muted-foreground">The event you're looking for doesn't exist</p>
        </div>
      </Card>
    )
  }

  const ticketTypes = Object.entries(campaign.ticketTypes)
  const selectedTicket = selectedTicketType ? campaign.ticketTypes[selectedTicketType] : null
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0
  const maxQuantity = selectedTicket
    ? Math.min(
        selectedTicket.quantity - (selectedTicket.sold || 0),
        campaign.maxPerCustomer,
        selectedTicket.maxPerOrder || 10,
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="relative h-96 rounded-lg overflow-hidden bg-muted">
        <img
          src={campaign.coverImage || `/placeholder.svg?height=400&width=1200&query=${campaign.title}`}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="secondary">{campaign.eventType}</Badge>
              <h1 className="text-4xl font-bold tracking-tight">{campaign.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(campaign.eventDate)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {campaign.venue}, {campaign.venueCity}
                </div>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={handleShare} className="bg-background/80 backdrop-blur-sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">About this event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
            </CardContent>
          </Card>

          {/* Event details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Event details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Date & Time</div>
                    <div className="text-sm text-muted-foreground">{formatDateTime(campaign.eventDate)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-sm text-muted-foreground">
                      {campaign.venue}
                      <br />
                      {campaign.venueAddress}, {campaign.venueCity}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Availability</div>
                    <div className="text-sm text-muted-foreground">
                      {campaign.totalQuantity - campaign.soldQuantity} of {campaign.totalQuantity} tickets left
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Ticket className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Organized by</div>
                    <div className="text-sm text-muted-foreground">{campaign.seller?.businessName}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image gallery */}
          {campaign.images && campaign.images.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {campaign.images.map((image, index) => (
                    <div key={index} className="relative h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${campaign.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select tickets</h3>
                <div className="space-y-3">
                  {ticketTypes.map(([type, ticket]) => {
                    const available = ticket.quantity - (ticket.sold || 0)
                    const isSelected = selectedTicketType === type
                    const isSoldOut = available <= 0

                    return (
                      <button
                        key={type}
                        onClick={() => !isSoldOut && setSelectedTicketType(type)}
                        disabled={isSoldOut}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : isSoldOut
                              ? "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                              : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-semibold capitalize">{type}</div>
                            {ticket.description && (
                              <div className="text-sm text-muted-foreground mt-1">{ticket.description}</div>
                            )}
                            <div className="text-sm text-muted-foreground mt-2">
                              {isSoldOut ? "Sold out" : `${available} available`}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(ticket.price)}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedTicket && (
                <>
                  {/* Quantity selector */}
                  <div>
                    <Label className="mb-2 block">Quantity</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 text-center font-semibold">{quantity}</div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Maximum {maxQuantity} tickets per order</p>
                  </div>

                  {/* Issuance type */}
                  <div>
                    <Label className="mb-2 block">Ticket issuance</Label>
                    <RadioGroup value={issuanceType} onValueChange={(value) => setIssuanceType(value as IssuanceType)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SINGLE" id="single" />
                        <Label htmlFor="single" className="font-normal cursor-pointer">
                          Single ticket (all in one)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SEPARATE" id="separate" />
                        <Label htmlFor="separate" className="font-normal cursor-pointer">
                          Separate tickets (individual)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-2xl font-bold">{formatCurrency(totalPrice)}</span>
                    </div>

                    <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full h-11" size="lg">
                          Book now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm booking</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Event</span>
                              <span className="font-medium">{campaign.title}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Ticket type</span>
                              <span className="font-medium capitalize">{selectedTicketType}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Quantity</span>
                              <span className="font-medium">{quantity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Issuance</span>
                              <span className="font-medium">
                                {issuanceType === "SINGLE" ? "Single ticket" : "Separate tickets"}
                              </span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-border">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Total amount</span>
                              <span className="text-2xl font-bold">{formatCurrency(totalPrice)}</span>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            You'll be redirected to the payment page. Payment must be completed within 15 minutes.
                          </p>

                          <Button
                            className="w-full h-11"
                            onClick={handleBooking}
                            disabled={createBookingMutation.isPending}
                          >
                            {createBookingMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Confirm & pay"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
