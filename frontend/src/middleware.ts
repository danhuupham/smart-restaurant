import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = ['/admin', '/kitchen', '/waiter'];

  // Check if the current path starts with any of the protected paths
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    // Check for "accessToken" cookie
    // Note: If you are using localStorage only, middleware cannot see it.
    // Ideally, the backend login should set a cookie, or the client should set it.
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      // Redirect to login page if no token is found
      const loginUrl = new URL('/login', request.url);
      // Optional: Add ?from=... to redirect back after login
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Continue to the requested page
  return NextResponse.next();
}

export const config = {
  // Apply to all routes except static files, api, _next, etc.
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|webp|svg|ico)$).*)',
  ],
};