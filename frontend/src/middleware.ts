import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Use 'export default' to ensure Next.js detects the entry point correctly
export default function middleware(request: NextRequest) {
  // 1. Get the token from cookies
  const token = request.cookies.get('accessToken')?.value

  const { pathname } = request.nextUrl

  // 2. Define protected routes
  const protectedRoutes = ['/admin', '/kitchen', '/waiter']
  
  // 3. Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // 4. Handle Protected Routes
  if (isProtectedRoute) {
    if (!token) {
      // If user is not logged in, redirect to login page
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  // 5. Handle Login Route (Prevent logged-in users from seeing login page)
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (svgs, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)',
  ],
}