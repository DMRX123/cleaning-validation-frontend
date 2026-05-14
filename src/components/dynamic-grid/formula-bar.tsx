'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FunctionSquare, Check, X } from 'lucide-react'
import { useState } from 'react'

interface FormulaBarProps {
  value: string
  onChange: (value: string) => void
  onApply: (formula: string) => void
}

export function FormulaBar({ value, onChange, onApply }: FormulaBarProps) {
  const [isFormulaMode, setIsFormulaMode] = useState(false)

  const handleApply = () => {
    onApply(value)
    setIsFormulaMode(false)
  }

  const handleCancel = () => {
    onChange('')
    setIsFormulaMode(false)
  }

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
      <div className="flex items-center gap-1">
        <FunctionSquare className="h-4 w-4 text-gray-500" />
        <span className="text-xs text-gray-500">fx</span>
      </div>
      <div className="flex-1 relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter value or formula (start with = for formula)..."
          className="font-mono text-sm"
          onFocus={() => setIsFormulaMode(true)}
        />
      </div>
      <Button size="sm" variant="ghost" onClick={handleApply}>
        <Check className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
