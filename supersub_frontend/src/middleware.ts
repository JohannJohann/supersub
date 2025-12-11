import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the JWT token from HTTP-only cookie
  const token = request.cookies.get('jwt')?.value;
  
  const { pathname } = request.nextUrl;
  
  // If user has a token (authenticated)
  if (token) {
    // If authenticated user tries to access auth pages, redirect to home
    if (pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to other pages
    return NextResponse.next();
  }
  
  // If user doesn't have a token (not authenticated)
  if (!token) {
    // Allow access to auth pages (login, signup)
    if (pathname.startsWith('/auth')) {
      return NextResponse.next();
    }
    // Redirect to login for all other pages
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};