'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'

interface CellProps {
  value: string
  onChange: (value: string) => void
  formula?: string
}

export function Cell({ value, onChange, formula }: CellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayValue, setDisplayValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (formula) {
      // If has formula, show formula result
      setDisplayValue(value)
    } else {
      setDisplayValue(value)
    }
  }, [value, formula])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    if (formula) {
      setDisplayValue(formula)
    }
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    onChange(displayValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      onChange(displayValue)
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setDisplayValue(value)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value)
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-full border-0 rounded-none focus-visible:ring-0"
      />
    )
  }

  return (
    <div
      className="px-4 py-2 min-w-[100px] cursor-cell hover:bg-gray-50"
      onDoubleClick={handleDoubleClick}
      onClick={() => setIsEditing(true)}
    >
      {formula ? (
        <span className="text-pharma-600 font-mono text-sm">
          {value || `=${formula}`}
        </span>
      ) : (
        <span>{displayValue}</span>
      )}
    </div>
  )
}