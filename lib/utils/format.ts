// import { format, formatDistance } from "date-fns"

// // Format currency
// export function formatCurrency(amount: number, currency = "UGX"): string {
//   return new Intl.NumberFormat("en-UG", {
//     style: "currency",
//     currency,
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount)
// }

// // Format date
// export function formatDate(date: string | Date, formatStr = "PPP"): string {
//   return format(new Date(date), formatStr)
// }

// // Format date time
// export function formatDateTime(date: string | Date): string {
//   return format(new Date(date), "PPP p")
// }

// // Format relative time (e.g., "2 hours ago")
// export function formatRelativeTime(date: string | Date): string {
//   return formatDistance(new Date(date), new Date(), { addSuffix: true })
// }

// // Format ticket number
// export function formatTicketNumber(ticketNumber: string): string {
//   return ticketNumber.toUpperCase()
// }

// // Format booking reference
// export function formatBookingRef(ref: string): string {
//   return ref.toUpperCase()
// }

// // Truncate text
// export function truncate(text: string, length: number): string {
//   if (text.length <= length) return text
//   return text.slice(0, length) + "..."
// }

// // Format phone number
// export function formatPhoneNumber(phone: string): string {
//   // Remove all non-digit characters
//   const cleaned = phone.replace(/\D/g, "")

//   // Format as +XXX XXX XXX XXX
//   if (cleaned.length >= 10) {
//     return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
//   }

//   return phone
// }

import { format, formatDistance } from "date-fns"

// Format currency
export function formatCurrency(amount: number, currency = "UGX"): string {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper to validate date (Internal use)
function isValidDate(date: any): boolean {
  if (!date) return false
  const d = new Date(date)
  return !isNaN(d.getTime())
}

// Format date
// Added 'null | undefined' to type definition to handle optional API fields
export function formatDate(date: string | Date | null | undefined, formatStr = "PPP"): string {
  if (!isValidDate(date)) return "N/A"
  return format(new Date(date!), formatStr)
}

// Format date time
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!isValidDate(date)) return "N/A"
  return format(new Date(date!), "PPP p")
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!isValidDate(date)) return "Just now"
  return formatDistance(new Date(date!), new Date(), { addSuffix: true })
}

// Format ticket number
export function formatTicketNumber(ticketNumber: string): string {
  if (!ticketNumber) return ""
  return ticketNumber.toUpperCase()
}

// Format booking reference
export function formatBookingRef(ref: string): string {
  if (!ref) return ""
  return ref.toUpperCase()
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (!text) return ""
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ""
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "")

  // Format as +XXX XXX XXX XXX
  if (cleaned.length >= 10) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
  }

  return phone
}