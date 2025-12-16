import { z } from "zod"

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const sellerApplicationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessType: z.string().min(1, "Business type is required"),
  businessDescription: z.string().min(20, "Business description must be at least 20 characters"),
})

// Campaign schemas
export const campaignSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  eventType: z.string().min(1, "Event type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().min(3, "Location is required"),
  imageUrl: z.string().optional(),
  status: z.enum(["draft", "active", "completed", "cancelled"]).default("draft"),
  ticketTypes: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().positive(),
        quantity: z.number().positive(),
      }),
    )
    .optional(),
})

// Booking schemas
export const bookingSchema = z.object({
  campaignId: z.string().min(1, "Campaign is required"),
  ticketType: z.string().min(1, "Ticket type is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 characters"),
})

// Finance schemas
export const withdrawalRequestSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  accountNumber: z.string().min(5, "Account number is required"),
  accountName: z.string().min(2, "Account name is required"),
  bankName: z.string().min(2, "Bank name is required"),
})
