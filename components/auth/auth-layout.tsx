import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Ticket } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Background Image with Branding Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="/luco-image.png"
          alt="Authentication background"
          fill
          priority
          className="object-cover"
          sizes="25vw"
          quality={90}
        />

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black/90" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Link href="/" className="flex items-center gap-2 text-white hover:text-white/90 transition-colors">
              <Image
                src="/logo.png"
                alt="LucoTicket"
                width={32}
                height={32}
                className="h-16 w-auto"
              />
            </Link>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight text-balance text-white">
              Your gateway to
              <br />
              unforgettable events
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Connect with amazing experiences. Whether you're attending or hosting, we make ticketing seamless.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-sm text-white/70">Trusted by thousands</span>
              <div className="h-px flex-1 bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo - only visible on smaller screens */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <Image
                src="/logo.png"
                alt="LucoTicket"
                width={32}
                height={32}
                className="h-16 w-auto"
              />
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
