import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define role-based route permissions
const rolePermissions: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/kitchen': ['KITCHEN'],
  '/waiter': ['WAITER'],
};

// Helper function to decode JWT payload without verification (for role checking)
function decodeJwtPayload(token: string): { sub: string; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Base64Url decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = ['/admin', '/kitchen', '/waiter'];

  // Check if the current path starts with any of the protected paths
  const matchedPath = protectedPaths.find((path) => pathname.startsWith(path));

  if (matchedPath) {
    // Check for "accessToken" cookie
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      // Redirect to login page if no token is found
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode JWT to get role
    const decoded = decodeJwtPayload(token);

    if (!decoded || !decoded.role) {
      // Invalid token - redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    const allowedRoles = rolePermissions[matchedPath];
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      // User doesn't have permission - redirect to appropriate dashboard
      let redirectPath = '/login';

      if (decoded.role === 'ADMIN') {
        redirectPath = '/admin/dashboard';
      } else if (decoded.role === 'KITCHEN') {
        redirectPath = '/kitchen';
      } else if (decoded.role === 'WAITER') {
        redirectPath = '/waiter';
      } else if (decoded.role === 'CUSTOMER') {
        redirectPath = '/guest/profile';
      }

      // Avoid redirect loop
      if (redirectPath !== pathname && !pathname.startsWith(redirectPath)) {
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
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
