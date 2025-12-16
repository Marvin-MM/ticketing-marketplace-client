import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session cookie
  const sessionId = request.cookies.get("sessionId")
  const isAuthenticated = !!sessionId

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/apply-seller", "/events"]
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/payment/callback")

  // Auth routes - redirect if already authenticated
  const authRoutes = ["/login", "/register", "/apply-seller"]
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Protected routes - redirect to login if not authenticated
  const customerRoutes = ["/dashboard", "/bookings", "/tickets", "/profile"]
  const isCustomerRoute = customerRoutes.some((route) => pathname.startsWith(route))
  const isSellerRoute = pathname.startsWith("/seller")

  if ((isCustomerRoute || isSellerRoute) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
