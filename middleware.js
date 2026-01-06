// middleware.js (in root of your Next.js project)
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Paths that don't require authentication
  const publicPaths = ['/', '/api/login', '/api/setup-admin'];
  
  // Check if the path is public
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const authToken = request.cookies.get('auth_token')?.value;
  
  // If no auth token, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};