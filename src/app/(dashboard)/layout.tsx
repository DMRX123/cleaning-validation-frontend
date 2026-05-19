// src/app/(dashboard)/layout.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for authentication (dummy check for demo)
    const token = localStorage.getItem('token')
    const isAuthPage = pathname === '/login' || pathname === '/register'
    
    if (!token && !isAuthPage && pathname !== '/') {
      // For demo, auto-set dummy token
      localStorage.setItem('token', 'demo_token')
    }
  }, [pathname, router])

  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}