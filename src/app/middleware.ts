import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname === '/' ||
                          request.nextUrl.pathname.startsWith('/products') ||
                          request.nextUrl.pathname.startsWith('/equipment') ||
                          request.nextUrl.pathname.startsWith('/validation') ||
                          request.nextUrl.pathname.startsWith('/reports')

  if (!token && isDashboardPage && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/products/:path*',
    '/equipment/:path*',
    '/validation/:path*',
    '/reports/:path*',
    '/login',
    '/register',
  ],
}