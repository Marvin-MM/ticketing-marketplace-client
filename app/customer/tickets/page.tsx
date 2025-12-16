// "use client"

// import { useQuery } from "@tanstack/react-query"
// import { Ticket, Calendar, MapPin, Download, QrCode } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { bookingsApi } from "@/lib/api/bookings"
// import { formatDate } from "@/lib/utils/format"
// import { queryKeys } from "@/lib/queryClient"

// export default function TicketsPage() {
//   const { data, isLoading } = useQuery({
//     queryKey: queryKeys.bookings.myBookings(),
//     queryFn: () => bookingsApi.getMyBookings(),
//   })

//   const bookings = data?.bookings || []

//   const confirmedBookings = bookings.filter((b) => b.status === "confirmed")
//   const upcomingTickets = confirmedBookings.filter((b) => new Date(b.campaign?.startDate || "") > new Date())
//   const pastTickets = confirmedBookings.filter((b) => new Date(b.campaign?.startDate || "") <= new Date())

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     )
//   }

//   const TicketCard = ({ booking }: { booking: any }) => (
//     <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex-1">
//           <h3 className="text-xl font-semibold mb-2">{booking.campaign?.name}</h3>
//           <div className="space-y-2 text-sm text-muted-foreground">
//             <div className="flex items-center gap-2">
//               <Calendar className="h-4 w-4" />
//               {formatDate(booking.campaign?.startDate)}
//             </div>
//             <div className="flex items-center gap-2">
//               <MapPin className="h-4 w-4" />
//               {booking.campaign?.location}
//             </div>
//             <div className="flex items-center gap-2">
//               <Ticket className="h-4 w-4" />
//               {booking.ticketType} × {booking.quantity}
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-col items-end gap-2">
//           <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
//             Confirmed
//           </Badge>
//           <div className="h-20 w-20 bg-white rounded flex items-center justify-center">
//             <QrCode className="h-16 w-16 text-black" />
//           </div>
//         </div>
//       </div>

//       <div className="pt-4 border-t border-border flex items-center justify-between">
//         <div className="text-sm text-muted-foreground">
//           Ref: <span className="font-mono">{booking.bookingReference}</span>
//         </div>
//         <Button variant="outline" size="sm">
//           <Download className="h-4 w-4 mr-2" />
//           Download
//         </Button>
//       </div>
//     </Card>
//   )

//   return (
//     <div className="space-y-8">
//       <div>
//         <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
//         <p className="text-muted-foreground">View and manage your event tickets</p>
//       </div>

//       <Tabs defaultValue="upcoming" className="space-y-6">
//         <TabsList>
//           <TabsTrigger value="upcoming">Upcoming ({upcomingTickets.length})</TabsTrigger>
//           <TabsTrigger value="past">Past ({pastTickets.length})</TabsTrigger>
//         </TabsList>

//         <TabsContent value="upcoming" className="space-y-4">
//           {upcomingTickets.length === 0 ? (
//             <Card className="p-12 text-center">
//               <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//               <h3 className="text-xl font-semibold mb-2">No upcoming tickets</h3>
//               <p className="text-muted-foreground mb-6">Book tickets to your favorite events to see them here</p>
//               <Button asChild>
//                 <a href="/events">Browse Events</a>
//               </Button>
//             </Card>
//           ) : (
//             <div className="grid gap-4">
//               {upcomingTickets.map((booking) => (
//                 <TicketCard key={booking._id} booking={booking} />
//               ))}
//             </div>
//           )}
//         </TabsContent>

//         <TabsContent value="past" className="space-y-4">
//           {pastTickets.length === 0 ? (
//             <Card className="p-12 text-center">
//               <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//               <h3 className="text-xl font-semibold mb-2">No past tickets</h3>
//               <p className="text-muted-foreground">Your past event tickets will appear here</p>
//             </Card>
//           ) : (
//             <div className="grid gap-4">
//               {pastTickets.map((booking) => (
//                 <TicketCard key={booking._id} booking={booking} />
//               ))}
//             </div>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }


"use client"

import { useQuery } from "@tanstack/react-query"
import { Ticket, Calendar, MapPin, Download, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { bookingsApi } from "@/lib/api/bookings"
import { formatDate } from "@/lib/utils/format"
import { queryKeys } from "@/lib/queryClient"
import { useState } from "react"

export default function TicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.bookings.myBookings(),
    queryFn: () => bookingsApi.getMyBookings(),
  })

  const bookings = data?.bookings || []

  // Only get confirmed bookings that have tickets
  const confirmedBookingsWithTickets = bookings.filter(
    (b) => b.status === "CONFIRMED" && b.tickets && b.tickets.length > 0
  )

  const upcomingTickets = confirmedBookingsWithTickets.filter(
    (b) => new Date(b.campaign?.eventDate || "") > new Date()
  )
  const pastTickets = confirmedBookingsWithTickets.filter(
    (b) => new Date(b.campaign?.eventDate || "") <= new Date()
  )

  const handleViewTicket = (ticket: any, booking: any) => {
    setSelectedTicket({ ...ticket, booking })
    setPdfViewerOpen(true)
  }

  const handleDownloadTicket = (pdfUrl: string, ticketNumber: string) => {
    // Create a temporary link and trigger download
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = `${ticketNumber}.pdf`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const TicketCard = ({ booking }: { booking: any }) => {
    const ticket = booking.tickets[0] // For SINGLE issuance, there's typically one ticket
    const hasMultipleTickets = booking.tickets.length > 1

    return (
      <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{booking.campaign?.title}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(booking.campaign?.eventDate)}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {booking.campaign?.venue}
                {booking.campaign?.venueCity ? `, ${booking.campaign.venueCity}` : ""}
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                {booking.ticketType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} ×{" "}
                {booking.tickets.length}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="outline"
              className={
                ticket.status === "VALID"
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : ticket.status === "USED"
                  ? "bg-gray-500/10 text-gray-500 border-gray-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20"
              }
            >
              {ticket.status}
            </Badge>
            {ticket.scanCount > 0 && (
              <span className="text-xs text-muted-foreground">
                Scanned: {ticket.scanCount}/{ticket.maxScans}
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted-foreground">
              Ticket: <span className="font-mono">{ticket.ticketNumber}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Booking: <span className="font-mono">{booking.bookingRef}</span>
            </div>
          </div>

          {hasMultipleTickets ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">
                {booking.tickets.length} tickets in this booking
              </p>
              <div className="grid grid-cols-2 gap-2">
                {booking.tickets.map((t: any) => (
                  <div key={t.id} className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewTicket(t, booking)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View {t.ticketNumber.split("_")[1].slice(0, 4)}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => handleViewTicket(ticket, booking)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Ticket
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadTicket(ticket.pdfUrl, ticket.ticketNumber)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">View and manage your event tickets</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingTickets.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingTickets.length === 0 ? (
              <Card className="p-12 text-center">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No upcoming tickets</h3>
                <p className="text-muted-foreground mb-6">
                  Book tickets to your favorite events to see them here
                </p>
                <Button asChild>
                  <a href="/events">Browse Events</a>
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingTickets.map((booking) => (
                  <TicketCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastTickets.length === 0 ? (
              <Card className="p-12 text-center">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No past tickets</h3>
                <p className="text-muted-foreground">Your past event tickets will appear here</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pastTickets.map((booking) => (
                  <TicketCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* PDF Viewer Dialog */}
      <Dialog open={pdfViewerOpen} onOpenChange={setPdfViewerOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              {selectedTicket?.booking?.campaign?.title} - {selectedTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 px-6 pb-6 overflow-hidden">
            <div className="w-full h-full border rounded-lg overflow-hidden bg-gray-50">
              <iframe
                src={selectedTicket?.pdfUrl}
                className="w-full h-full"
                title="Ticket PDF"
              />
            </div>
          </div>
          <div className="p-6 pt-0 flex gap-2 border-t">
            <Button
              variant="default"
              onClick={() =>
                handleDownloadTicket(selectedTicket?.pdfUrl, selectedTicket?.ticketNumber)
              }
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Ticket
            </Button>
            <Button variant="outline" onClick={() => setPdfViewerOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}