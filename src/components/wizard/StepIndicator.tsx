// src/components/wizard/StepIndicator.tsx
'use client'

import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  id: number
  name: string
  description: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  getStepStatus?: (stepId: number) => 'completed' | 'current' | 'pending' | 'locked'
  onStepClick?: (stepId: number) => void
}

export function StepIndicator({ steps, currentStep, getStepStatus, onStepClick }: StepIndicatorProps) {
  const defaultGetStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed'
    if (stepId === currentStep) return 'current'
    return 'pending'
  }

  const statusFn = getStepStatus || defaultGetStatus

  const handleStepClick = (stepId: number) => {
    const status = statusFn(stepId)
    if (status !== 'locked' && onStepClick) {
      onStepClick(stepId)
    }
  }

  // Helper to get circle classes
  const getCircleClass = (status: string) => {
    const baseClass = "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 z-10 relative"
    if (status === 'completed') return `${baseClass} bg-green-600 text-white`
    if (status === 'current') return `${baseClass} bg-yellow-500 text-white ring-4 ring-yellow-200`
    if (status === 'locked') return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`
    return `${baseClass} bg-gray-200 text-gray-500`
  }

  // Helper to get label classes
  const getLabelClass = (status: string) => {
    const baseClass = "text-xs font-medium mt-2 text-center"
    if (status === 'completed') return `${baseClass} text-green-700`
    if (status === 'current') return `${baseClass} text-yellow-600`
    if (status === 'locked') return `${baseClass} text-gray-400`
    return `${baseClass} text-gray-500`
  }

  // Helper to get connector class
  const getConnectorClass = (status: string, isLast: boolean) => {
    if (isLast) return "hidden"
    const baseClass = "absolute top-5 left-1/2 right-[-50%] h-0.5 -translate-y-1/2"
    if (status === 'completed') return `${baseClass} bg-green-600`
    return `${baseClass} bg-gray-300`
  }

  return (
    <div className="w-full py-6 px-4">
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => {
          const status = statusFn(step.id)
          const isCompleted = status === 'completed'
          const isCurrent = status === 'current'
          const isLocked = status === 'locked'
          const isLast = index === steps.length - 1
          
          return (
            <div 
              key={step.id} 
              className="flex-1 relative flex flex-col items-center"
              onClick={() => handleStepClick(step.id)}
              style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
            >
              {/* Connector Line - Left side (except first) */}
              {index > 0 && (
                <div 
                  className={cn(
                    "absolute top-5 left-[-50%] right-[50%] h-0.5 -translate-y-1/2",
                    steps[index - 1] && statusFn(steps[index - 1].id) === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                  )}
                />
              )}
              
              {/* Step Circle */}
              <div className={getCircleClass(status)}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className={getLabelClass(status)}>
                <div className="font-medium">{step.name}</div>
                <div className="text-xs text-gray-400 hidden sm:block">{step.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}