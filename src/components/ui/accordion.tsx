'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface AccordionContextValue {
  openValue: string | null
  setOpenValue: (value: string | null) => void
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

export function Accordion({ 
  type, 
  collapsible, 
  children, 
  className,
  defaultValue
}: { 
  type?: string; 
  collapsible?: boolean; 
  children: React.ReactNode; 
  className?: string;
  defaultValue?: string;
}) {
  const [openValue, setOpenValue] = React.useState<string | null>(defaultValue || null)

  return (
    <AccordionContext.Provider value={{ openValue, setOpenValue }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({ 
  value, 
  children, 
  className 
}: { 
  value: string; 
  children: React.ReactNode; 
  className?: string 
}) {
  const context = React.useContext(AccordionContext)
  const isOpen = context?.openValue === value

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)} data-state={isOpen ? "open" : "closed"}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { value, isOpen })
        }
        return child
      })}
    </div>
  )
}

export function AccordionTrigger({ 
  children, 
  className,
  value,
  isOpen: propIsOpen
}: { 
  children: React.ReactNode; 
  className?: string;
  value?: string;
  isOpen?: boolean;
}) {
  const context = React.useContext(AccordionContext)
  const isOpen = propIsOpen !== undefined ? propIsOpen : context?.openValue === value
  const handleClick = () => {
    if (context && value) {
      context.setOpenValue(context.openValue === value ? null : value)
    }
  }

  return (
    <button
      className={cn(
        "flex w-full items-center justify-between p-4 text-left font-medium transition-all hover:bg-gray-50",
        className
      )}
      onClick={handleClick}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
    </button>
  )
}

export function AccordionContent({ 
  children, 
  className,
  isOpen: propIsOpen
}: { 
  children: React.ReactNode; 
  className?: string;
  isOpen?: boolean;
}) {
  const isOpen = propIsOpen !== undefined ? propIsOpen : false
  
  if (!isOpen) return null
  
  return (
    <div className={cn("p-4 pt-0", className)}>
      {children}
    </div>
  )
}