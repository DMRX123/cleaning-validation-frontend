'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'

interface CellEditorProps {
  initialValue: string
  onSave: (value: string) => void
  onCancel: () => void
  type?: 'text' | 'number' | 'formula'
}

export function CellEditor({ initialValue, onSave, onCancel, type = 'text' }: CellEditorProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(value)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleBlur = () => {
    onSave(value)
  }

  const inputProps = {
    ref: inputRef,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    className: "h-8 w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2",
    autoFocus: true,
    ...(type === 'number' && { type: 'number', step: 'any' })
  }

  return <Input {...inputProps} />
}