// src/components/ui/tabs.tsx - Add disabled support
'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  
  const contextValue = {
    value: value !== undefined ? value : internalValue,
    onValueChange: onValueChange || setInternalValue,
  }
  
  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn("flex border-b border-gray-200 mb-4", className)}>
      {children}
    </div>
  )
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean  // ADD THIS LINE
}

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")
  
  const isActive = context.value === value
  
  return (
    <button
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors",
        isActive && !disabled
          ? "border-b-2 border-pharma-600 text-pharma-600"
          : "text-gray-500 hover:text-gray-700",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={() => !disabled && context.onValueChange(value)}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")
  
  if (context.value !== value) return null
  
  return <div className={className}>{children}</div>
}