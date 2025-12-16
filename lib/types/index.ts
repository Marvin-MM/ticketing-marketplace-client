// User Types
export type UserRole = "CUSTOMER" | "SELLER" | "MANAGER" | "SUPER_ADMIN"
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  profilePicture?: string
  role: UserRole
  applicationStatus?: ApplicationStatus
  isActive: boolean
  createdAt: string
  updatedAt?: string
  _count?: {
    bookings: number
    campaigns: number
  }
}

// Campaign Types
export type EventType = "CONCERT" | "SPORTS" | "THEATER" | "CONFERENCE" | "FESTIVAL" | "BAR" | "HOTEL" | "OTHER"
export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED" | "CANCELLED"

export interface TicketType {
  price: number
  quantity: number
  sold?: number
  description?: string
  maxPerOrder?: number
  benefits?: string[]
}

export interface Campaign {
  id: string
  title: string
  description: string
  eventType: EventType
  ticketTypes: Record<string, TicketType>
  totalQuantity: number
  soldQuantity: number
  maxPerCustomer: number
  eventDate: string
  startDate?: string
  endDate?: string
  venue: string
  venueAddress: string
  venueCity: string
  venueCountry?: string
  coverImage: string
  images?: string[]
  status: CampaignStatus
  isMultiScan?: boolean
  maxScansPerTicket?: number
  tags?: string[]
  metadata?: Record<string, any>
  seller?: {
    id: string
    businessName: string
  }
  analytics?: {
    totalViews: number
    totalBookings: number
  }
  createdAt: string
  updatedAt?: string
}

// Booking Types
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED"
export type IssuanceType = "SINGLE" | "SEPARATE"

export interface Booking {
  id: string
  bookingRef: string
  status: BookingStatus
  quantity: number
  ticketType: string
  issuanceType: IssuanceType
  totalAmount: number
  paymentDeadline?: string
  campaign: {
    id: string
    title: string
    eventDate: string
    venue: string
    coverImage: string
  }
  payment?: {
    id: string
    status: string
    amount: number
    paymentMethod?: string
    reference?: string
  }
  tickets?: Ticket[]
  createdAt: string
  updatedAt?: string
}

// Ticket Types
export type TicketStatus = "VALID" | "USED" | "EXPIRED" | "CANCELLED"

export interface Ticket {
  id: string
  ticketNumber: string
  qrCode: string
  pdfUrl?: string
  status: TicketStatus
  scanCount: number
  maxScans: number
  bookingId: string
  createdAt: string
}

// Payment Types
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"

export interface Payment {
  id: string
  reference: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod?: string
  booking?: {
    id: string
    bookingRef: string
    campaign?: {
      title: string
    }
  }
  createdAt: string
}

// Finance Types
export type WithdrawalStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
export type WithdrawalMethod = "BANK_ACCOUNT" | "MOBILE_MONEY" | "PAYPAL"
export type TransactionType = "SALE" | "WITHDRAWAL" | "REFUND" | "FEE"

export interface FinanceDashboard {
  finance: {
    totalEarnings: number
    availableBalance: number
    pendingBalance: number
    withdrawnAmount: number
    availableForWithdrawal?: number
    estimatedTaxes?: number
    nextPayoutDate?: string
  }
  transactions: Transaction[]
  withdrawalMethods: WithdrawalMethodData[]
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  reference: string
  description: string
  date: string
}

export interface WithdrawalMethodData {
  id: string
  method: WithdrawalMethod
  accountName: string
  accountNumber?: string
  bankName?: string
  bankCode?: string
  mobileProvider?: string
  mobileNumber?: string
  paypalEmail?: string
  isDefault: boolean
  status: "PENDING" | "VERIFIED"
}

export interface Withdrawal {
  id: string
  amount: number
  fee?: number
  netAmount?: number
  status: WithdrawalStatus
  method: WithdrawalMethodData
  requestedDate: string
  processedDate?: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  status?: "fail" | "error"
  errors?: Array<{ field: string; message: string }>
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Filter Types
export interface CampaignFilters {
  search?: string
  eventType?: EventType
  city?: string
  priceMin?: number
  priceMax?: number
  dateFrom?: string
  dateTo?: string
  tags?: string
  sortBy?: "eventDate" | "createdAt" | "price" | "popularity"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export interface BookingFilters {
  status?: BookingStatus
  campaignId?: string
  page?: number
  limit?: number
}
