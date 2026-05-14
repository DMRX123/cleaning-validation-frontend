// src/middleware.ts
// Next.js Middleware for Authentication, Route Protection, and Request Logging

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================
// CONFIGURATION
// ============================================

// Public routes - no authentication required
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/token',
  '/health',
  '/api/health',
]

// Protected routes - authentication required
const PROTECTED_ROUTES = [
  '/dashboard',
  '/products',
  '/equipment',
  '/validation',
  '/reports',
  '/settings',
  '/guidelines',
  '/api/products',
  '/api/equipment',
  '/api/calculations',
  '/api/validation',
  '/api/reports',
  '/api/dashboard',
  '/api/static',
  '/api/cleaning-validation',
  '/api/protocols',
]

// Admin only routes
const ADMIN_ROUTES = [
  '/settings',
  '/api/users',
  '/api/admin',
  '/api/audit',
]

// API routes that don't need authentication (backend handles its own auth)
const API_PUBLIC_ROUTES = [
  '/api/static',
  '/api/static/plants',
  '/api/static/solubility',
  '/api/static/difficulty',
  '/api/static/equipment-types',
  '/api/health',
  '/api/info',
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if path matches any pattern in routes array
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    // Exact match
    if (pathname === route) return true
    // Route prefix match (for nested routes)
    if (route.endsWith('/')) {
      return pathname.startsWith(route)
    }
    return pathname.startsWith(route + '/') || pathname === route
  })
}

/**
 * Check if path is a static asset
 */
function isStaticAsset(pathname: string): boolean {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.json', '.woff', '.woff2', '.ttf']
  return staticExtensions.some(ext => pathname.endsWith(ext))
}

/**
 * Check if path is an API route
 */
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

/**
 * Get token from request (cookie, authorization header, or query param)
 * FIXED: Now checks multiple sources including cookie, header, and URL query param
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Check cookie first (for middleware compatibility)
  const cookieToken = request.cookies.get('token')?.value
  if (cookieToken) return cookieToken
  
  // Check authorization header (for API clients)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Check URL query parameter (for fallback scenarios)
  const urlToken = request.nextUrl.searchParams.get('token')
  if (urlToken) return urlToken
  
  return null
}

/**
 * Verify if token is valid (basic validation)
 * In production, you would verify with backend
 */
function isValidToken(token: string): boolean {
  // Basic validation - token should not be empty and should be a string
  if (!token || typeof token !== 'string') return false
  
  // Simple format check (JWT has 3 parts separated by dots)
  const parts = token.split('.')
  if (parts.length !== 3) return false
  
  return true
}

/**
 * Decode JWT payload (without verification)
 */
function decodeToken(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    return payload
  } catch {
    return null
  }
}

/**
 * Check if user is admin from token
 */
function isAdminFromToken(token: string): boolean {
  const decoded = decodeToken(token)
  return decoded?.is_admin === true || decoded?.admin === true
}

/**
 * Log request for audit (in production, send to logging service)
 */
async function logRequest(request: NextRequest, status: number, userId?: string) {
  // In production, send to logging service or database
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname} - ${status} - User: ${userId || 'anonymous'}`)
  }
}

// ============================================
// MAIN MIDDLEWARE FUNCTION
// ============================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }
  
  // Check if route is public
  const isPublicRoute = matchesRoute(pathname, PUBLIC_ROUTES)
  const isApiPublicRoute = matchesRoute(pathname, API_PUBLIC_ROUTES)
  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES)
  const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES)
  
  // Get authentication token
  const token = getTokenFromRequest(request)
  const isAuthenticated = token !== null && isValidToken(token)
  const isAdmin = isAuthenticated && isAdminFromToken(token!)
  
  // ============================================
  // ROUTE PROTECTION LOGIC
  // ============================================
  
  // Case 1: Authenticated user trying to access login/register pages
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }
  
  // Case 2: Unauthenticated user trying to access protected routes
  if (!isAuthenticated && isProtectedRoute && !isPublicRoute && !isApiPublicRoute) {
    // For API routes, return 401 JSON response
    if (isApiRoute(pathname)) {
      return new NextResponse(
        JSON.stringify({ 
          detail: 'Authentication required',
          status: 401,
          message: 'Please login to access this resource'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
    
    // For page routes, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Case 3: Non-admin user trying to access admin routes
  if (isAdminRoute && !isAdmin && isAuthenticated) {
    if (isApiRoute(pathname)) {
      return new NextResponse(
        JSON.stringify({ 
          detail: 'Admin access required',
          status: 403,
          message: 'You do not have permission to access this resource'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
    
    // Redirect to dashboard with error message
    const dashboardUrl = new URL('/dashboard', request.url)
    dashboardUrl.searchParams.set('error', 'admin_required')
    return NextResponse.redirect(dashboardUrl)
  }
  
  // ============================================
  // ADD SECURITY HEADERS
  // ============================================
  
  const response = NextResponse.next()
  
  // Security headers for all responses
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Add CSP header in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' http://localhost:8000 https://*.supabase.co"
    )
  }
  
  // Add token to response headers for API requests (to be used by frontend)
  if (isApiRoute(pathname) && token) {
    response.headers.set('X-User-Authenticated', 'true')
  }
  
  // Log request asynchronously
  const userId = isAuthenticated ? decodeToken(token!)?.sub || 'unknown' : undefined
  await logRequest(request, 200, userId)
  
  return response
}

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - fonts
     */
    '/((?!_next/static|_next/image|favicon.ico|public|fonts).*)',
  ],
}

// ============================================
// HELPER FUNCTIONS FOR ROUTE PROTECTION
// ============================================

/**
 * Get the redirect URL based on the current path
 */
export function getRedirectUrl(request: NextRequest): string {
  const { pathname, search } = request.nextUrl
  const redirectUrl = new URL('/login', request.url)
  redirectUrl.searchParams.set('redirect', `${pathname}${search}`)
  return redirectUrl.toString()
}

/**
 * Check if the request has a valid session
 */
export function hasValidSession(request: NextRequest): boolean {
  const token = getTokenFromRequest(request)
  if (!token) return false
  
  // Check if token is expired
  const decoded = decodeToken(token)
  if (decoded && decoded.exp) {
    const exp = decoded.exp * 1000 // Convert to milliseconds
    if (Date.now() >= exp) return false
  }
  
  return isValidToken(token)
}

/**
 * Get user info from token without verification
 */
export function getUserFromToken(request: NextRequest): { username: string; isAdmin: boolean } | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  
  const decoded = decodeToken(token)
  if (!decoded) return null
  
  return {
    username: decoded.sub || decoded.username || 'unknown',
    isAdmin: decoded.is_admin === true || decoded.admin === true
  }
}