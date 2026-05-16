// Fixed StepIndicator.tsx
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
    <div className="step-indicator-container">
      <div className="step-indicator-list">
        {steps.map((step, index) => {
          const status = statusFn(step.id)
          const isCompleted = status === 'completed'
          const isCurrent = status === 'current'
          const isLocked = status === 'locked'
          
          // Determine circle class
          let circleClass = 'step-indicator-circle'
          if (isCompleted) circleClass += ' step-indicator-circle-completed'
          else if (isCurrent) circleClass += ' step-indicator-circle-current'
          else if (isLocked) circleClass += ' step-indicator-circle-locked'
          else circleClass += ' step-indicator-circle-pending'
          
          // Determine label class
          let labelClass = 'step-indicator-label'
          if (isCompleted) labelClass += ' step-indicator-label-completed'
          else if (isCurrent) labelClass += ' step-indicator-label-current'
          else if (isLocked) labelClass += ' step-indicator-label-locked'
          else labelClass += ' step-indicator-label-pending'
          
          return (
            <div 
              key={step.id} 
              className="step-indicator-item"
              onClick={() => handleStepClick(step.id)}
            >
              <div className={circleClass}>
                {isCompleted ? <Check className="step-indicator-check-icon" /> : isLocked ? <Lock className="h-4 w-4" /> : step.id}
              </div>
              <div className={labelClass}>
                {step.name}
              </div>
              <div className="step-indicator-description">
                {step.description}
              </div>
              {index < steps.length - 1 && (
                <div className={`step-indicator-connector ${step.id < currentStep ? 'step-indicator-connector-active' : ''}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}