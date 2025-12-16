import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { QueryProvider } from "@/lib/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "LucoTicket - Your Event Ticketing Marketplace",
  description: "Discover and book tickets for amazing events. Create and manage your event campaigns.",
  generator: "v0.app",
  icons: {
    icon: "/favico.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
