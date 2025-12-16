"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { sellerApplicationFullSchema } from "@/lib/validations/auth"
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"
import type { z } from "zod"

type FullApplicationData = z.infer<typeof sellerApplicationFullSchema>

export default function ApplySellerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<FullApplicationData>({
    resolver: zodResolver(sellerApplicationFullSchema),
    mode: "onChange",
  })

  const businessType = watch("businessType")

  const onSubmit = async (data: FullApplicationData) => {
    setIsSubmitting(true)

    try {
      const { confirmPassword, terms, ...applicationData } = data
      await authApi.applySellerNew(applicationData as any)

      setIsSuccess(true)

      toast({
        title: "Application submitted!",
        description: "We'll review your application and get back to you via email within 2-3 business days.",
      })

      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      toast({
        title: "Application failed",
        description: error.message || "Could not submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: any[] = []

    if (step === 1) {
      fieldsToValidate = ["firstName", "lastName", "email", "password", "confirmPassword", "terms"]
    } else if (step === 2) {
      fieldsToValidate = ["businessName", "businessType", "businessAddress", "businessPhone", "businessEmail"]
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Application submitted!" subtitle="We'll be in touch soon">
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Thank you for applying!</h3>
            <p className="text-muted-foreground">
              We've received your seller application. Our team will review it and send you an email within 2-3 business
              days.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Apply as a seller"
      subtitle="Start selling tickets for your events. Complete the application below."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Step {step} of 3</span>
            <span className="text-muted-foreground">{Math.round((step / 3) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...register("firstName")} className="h-11" />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...register("lastName")} className="h-11" />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} className="h-11" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} className="h-11" />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} className="h-11" />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" type="tel" {...register("phone")} className="h-11" />
            </div>
          </div>
        )}

        {/* Step 2: Business Information */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Business Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input id="businessName" {...register("businessName")} className="h-11" />
              {errors.businessName && <p className="text-sm text-destructive">{errors.businessName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business type</Label>
              <Select onValueChange={(value) => setValue("businessType", value as any)} value={businessType}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.businessType && <p className="text-sm text-destructive">{errors.businessType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAddress">Business address</Label>
              <Input id="businessAddress" {...register("businessAddress")} className="h-11" />
              {errors.businessAddress && <p className="text-sm text-destructive">{errors.businessAddress.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business phone</Label>
                <Input id="businessPhone" type="tel" {...register("businessPhone")} className="h-11" />
                {errors.businessPhone && <p className="text-sm text-destructive">{errors.businessPhone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business email</Label>
                <Input id="businessEmail" type="email" {...register("businessEmail")} className="h-11" />
                {errors.businessEmail && <p className="text-sm text-destructive">{errors.businessEmail.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Additional Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID (optional)</Label>
              <Input id="taxId" {...register("taxId")} className="h-11" placeholder="Your tax identification number" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business description (optional)</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Tell us about your business and the types of events you plan to host..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL (optional)</Label>
              <Input id="websiteUrl" type="url" {...register("websiteUrl")} className="h-11" placeholder="https://" />
              {errors.websiteUrl && <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Social media (optional)</Label>
              <div className="space-y-2">
                <Input placeholder="Facebook URL" {...register("socialMediaHandles.facebook")} className="h-11" />
                <Input placeholder="Twitter/X URL" {...register("socialMediaHandles.twitter")} className="h-11" />
                <Input placeholder="Instagram URL" {...register("socialMediaHandles.instagram")} className="h-11" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-4">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-11 bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}

          {step < 3 ? (
            <Button type="button" onClick={nextStep} className="flex-1 h-11">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="flex-1 h-11">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit application"
              )}
            </Button>
          )}
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
