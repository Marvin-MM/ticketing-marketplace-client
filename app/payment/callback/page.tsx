"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { paymentsApi } from "@/lib/api/payments"
import Link from "next/link"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing")
  const [message, setMessage] = useState("Processing your payment...")

  const orderTrackingId = searchParams.get("OrderTrackingId")
  const orderMerchantReference = searchParams.get("OrderMerchantReference")

  const verifyMutation = useMutation({
    mutationFn: paymentsApi.verifyPayment,
    onSuccess: (data) => {
      if (data.status === "completed") {
        setStatus("success")
        setMessage("Payment successful! Your booking has been confirmed.")
      } else {
        setStatus("failed")
        setMessage("Payment verification failed. Please contact support.")
      }
    },
    onError: () => {
      setStatus("failed")
      setMessage("Failed to verify payment. Please contact support.")
    },
  })

  // useEffect(() => {
  //   if (orderTrackingId) {
  //     verifyMutation.mutate(orderTrackingId)
  //   } else {
  //     setStatus("failed")
  //     setMessage("Invalid payment reference")
  //   }
  // }, [orderTrackingId])
  
  useEffect(() => {
    // Pass the OrderMerchantReference to match the backend route
    if (orderMerchantReference) {
      verifyMutation.mutate(orderMerchantReference);
    } else if (orderTrackingId) {
      // As a fallback, maybe try tracking ID if reference is missing?
      // Or decide how to handle this case. For now, let's prioritize reference.
       setStatus("failed");
       setMessage("Invalid payment reference (Merchant Reference missing)");
    } else {
      setStatus("failed");
      setMessage("Payment details missing in callback");
    }
  }, [orderMerchantReference, orderTrackingId]); // Add both dependencies

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 bg-white/5 border-white/10 text-center">
        {status === "processing" && (
          <>
            <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-blue-500" />
            <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
            <p className="text-white/60">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-white/60 mb-6">{message}</p>
            <div className="space-y-3">
              <Link href="/bookings" className="block">
                <Button className="w-full">View My Bookings</Button>
              </Link>
              <Link href="/events" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Browse More Events
                </Button>
              </Link>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-white/60 mb-6">{message}</p>
            <div className="space-y-3">
              <Link href="/events" className="block">
                <Button className="w-full">Try Again</Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </>
        )}

        {orderMerchantReference && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-white/60">
              Reference: <span className="font-mono">{orderMerchantReference}</span>
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
