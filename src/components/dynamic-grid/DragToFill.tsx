'use client'

import { useState, useRef, useCallback } from 'react'

interface DragToFillProps {
  data: any[][]
  onFill: (startRow: number, startCol: number, endRow: number, endCol: number, direction: 'right' | 'down') => void
}

export function DragToFill({ data, onFill }: DragToFillProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null)
  const fillHandleRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true)
    setDragStart({ row, col })
  }

  const handleMouseUp = useCallback((row: number, col: number) => {
    if (isDragging && dragStart) {
      // Determine drag direction
      if (col > dragStart.col) {
        onFill(dragStart.row, dragStart.col, row, col, 'right')
      } else if (row > dragStart.row) {
        onFill(dragStart.row, dragStart.col, row, col, 'down')
      }
    }
    setIsDragging(false)
    setDragStart(null)
  }, [isDragging, dragStart, onFill])

  return (
    <div
      className="absolute bottom-0 right-0 w-2 h-2 bg-pharma-500 cursor-crosshair"
      ref={fillHandleRef}
      onMouseDown={(e) => {
        e.stopPropagation()
        // Get cell position from parent
      }}
    />
  )
}

// Helper function to fill cells based on pattern
export function fillPattern(
  sourceData: any[],
  targetCount: number,
  patternType: 'linear' | 'growth' | 'copy'
): any[] {
  if (sourceData.length === 0) return []
  
  const result = [...sourceData]
  
  if (patternType === 'copy') {
    // Copy first value to all
    while (result.length < targetCount) {
      result.push(sourceData[0])
    }
  } else if (patternType === 'linear') {
    // Linear interpolation
    const step = (sourceData[sourceData.length - 1] - sourceData[0]) / (sourceData.length - 1)
    while (result.length < targetCount) {
      const lastValue = result[result.length - 1]
      result.push(lastValue + step)
    }
  }
  
  return result.slice(0, targetCount)
}