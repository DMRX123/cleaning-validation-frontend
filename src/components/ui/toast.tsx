'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  onClose?: () => void
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  React.useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [onClose])
  
  return (
    <div
      className={cn(
        "pointer-events-auto relative w-full rounded-lg border p-4 shadow-md",
        variant === "destructive" && "border-red-200 bg-red-50 text-red-900",
        variant === "success" && "border-green-200 bg-green-50 text-green-900",
        variant === "default" && "border-gray-200 bg-white text-gray-900"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && <div className="font-medium">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="flex-shrink-0"
            aria-label="Close notification"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function Toaster({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {children}
    </div>
  )
}
