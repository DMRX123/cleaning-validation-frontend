'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps {
  onValueChange?: (value: number[]) => void
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, onValueChange, value = [0], min = 0, max = 100, step = 1, disabled = false, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [parseFloat(e.target.value)]
      if (onValueChange) {
        onValueChange(newValue)
      }
    }

    // Remove invalid props that shouldn't be passed to native input
    const { defaultValue, ...validProps } = props

    return (
      <div className="relative w-full">
        <input
          type="range"
          className={cn(
            "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          value={value[0]}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          ref={ref}
          {...validProps}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{min}</span>
          <span>{value[0]}</span>
          <span>{max}</span>
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
