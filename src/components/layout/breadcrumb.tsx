'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

export function Breadcrumb() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)
  
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
      <Link href="/dashboard" className="hover:text-pharma-600">
        <Home className="h-4 w-4" />
      </Link>
      {paths.map((path, index) => {
        const href = '/' + paths.slice(0, index + 1).join('/')
        const isLast = index === paths.length - 1
        const displayName = path.charAt(0).toUpperCase() + path.slice(1)
        
        return (
          <div key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{displayName}</span>
            ) : (
              <Link href={href} className="hover:text-pharma-600">
                {displayName}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}