'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface AcceptabilityBadgeProps {
  result: number
  limit: number
  loq?: number
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function AcceptabilityBadge({ result, limit, loq, showIcon = true, size = 'md' }: AcceptabilityBadgeProps) {
  const isAcceptable = result <= limit
  const isBelowLOQ = loq !== undefined && result < loq
  
  const getStatus = () => {
    if (isBelowLOQ) return 'below-limit'
    if (isAcceptable) return 'acceptable'
    return 'not-acceptable'
  }
  
  const getBadgeVariant = (): 'success' | 'destructive' | 'warning' | 'outline' => {
    if (isBelowLOQ) return 'outline'
    if (isAcceptable) return 'success'
    return 'destructive'
  }
  
  const getLabel = () => {
    if (isBelowLOQ) return 'Below LOQ'
    if (isAcceptable) return 'Acceptable'
    return 'Not Acceptable'
  }
  
  const getIcon = () => {
    if (isBelowLOQ) return <AlertTriangle className="h-3 w-3" />
    if (isAcceptable) return <CheckCircle className="h-3 w-3" />
    return <XCircle className="h-3 w-3" />
  }
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }
  
  return (
    <Badge variant={getBadgeVariant()} className={sizeClasses[size]}>
      {showIcon && getIcon()}
      {getLabel()}
    </Badge>
  )
}