import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const sellerApplicationSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.enum(["individual", "company", "organization", "other"]),
  businessAddress: z.string().min(5, "Business address is required"),
  businessPhone: z.string().min(10, "Valid phone number is required"),
  businessEmail: z.string().email("Invalid email address"),
  taxId: z.string().optional(),
  description: z.string().optional(),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  socialMediaHandles: z
    .object({
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
})

// Combined schema for seller application with user registration
export const sellerApplicationFullSchema = z.object({
  // User registration fields
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  terms: z.boolean(),
  
  // Seller application fields
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.enum(["individual", "company", "organization", "other"]),
  businessAddress: z.string().min(5, "Business address is required"),
  businessPhone: z.string().min(10, "Valid phone number is required"),
  businessEmail: z.string().email("Invalid email address"),
  taxId: z.string().optional(),
  description: z.string().optional(),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  socialMediaHandles: z
    .object({
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.terms === true, {
  message: "You must accept the terms and conditions",
  path: ["terms"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type SellerApplicationFormData = z.infer<typeof sellerApplicationSchema>
export type SellerApplicationFullFormData = z.infer<typeof sellerApplicationFullSchema>
