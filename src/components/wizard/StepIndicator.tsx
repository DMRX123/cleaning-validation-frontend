'use client'

import { cn } from '@/lib/utils'
import { Check, Lock } from 'lucide-react'

interface Step {
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

  return (
    <div className="w-full">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const status = statusFn(step.id)
          const isCompleted = status === 'completed'
          const isCurrent = status === 'current'
          const isLocked = status === 'locked'
          
          return (
            <div 
              key={step.id} 
              className="flex-1 relative cursor-pointer"
              onClick={() => handleStepClick(step.id)}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    isCompleted && "bg-pharma-600 text-white",
                    isCurrent && "bg-pharma-100 border-2 border-pharma-600 text-pharma-600",
                    isLocked && "bg-gray-200 text-gray-500 cursor-not-allowed",
                    !isCompleted && !isCurrent && !isLocked && "bg-gray-100 text-gray-500",
                    onStepClick && !isLocked && "hover:scale-105 transition-transform"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : isLocked ? <Lock className="h-4 w-4" /> : step.id}
                </div>
                <div className="mt-2 text-center">
                  <div className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-pharma-600",
                    isCompleted && "text-pharma-600",
                    isLocked && "text-gray-400",
                    !isCompleted && !isCurrent && !isLocked && "text-gray-500"
                  )}>
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-400 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 left-1/2 w-[calc(100%-2rem)] h-0.5 -translate-y-1/2 transition-all",
                    step.id < currentStep ? "bg-pharma-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
