'use client'

import { useState, useCallback, useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { FormulaBar } from './formula-bar'
import { Cell } from './cell'

interface ExcelGridProps {
  data: any[][]
  onDataChange: (data: any[][]) => void
  formulas?: Record<string, string>
  readOnly?: boolean
}

export function ExcelGrid({ data, onDataChange, formulas = {}, readOnly = false }: ExcelGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const gridRef = useRef<HTMLDivElement>(null)

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col })
    setEditingValue(String(data[row]?.[col] || ''))
  }

  const handleCellChange = (row: number, col: number, value: any) => {
    const newData = [...data]
    if (!newData[row]) newData[row] = []
    newData[row][col] = value
    onDataChange(newData)
  }

  const handleFormulaChange = (formula: string) => {
    if (selectedCell) {
      const cellKey = `${selectedCell.row},${selectedCell.col}`
      // Store formula
      // Evaluate and update cell value
      handleCellChange(selectedCell.row, selectedCell.col, formula)
    }
  }

  const getCellValue = (row: number, col: number): string => {
    const val = data[row]?.[col]
    if (val === undefined || val === null) return ''
    if (typeof val === 'number') return val.toString()
    return String(val)
  }

  return (
    <div className="border rounded-lg overflow-hidden" ref={gridRef}>
      <FormulaBar
        value={editingValue}
        onChange={setEditingValue}
        onApply={handleFormulaChange}
      />
      <div className="overflow-auto max-h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 bg-gray-100">#</TableHead>
              {data[0]?.map((_, colIdx) => (
                <TableHead key={colIdx} className="bg-gray-100">
                  {String.fromCharCode(65 + colIdx)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                <TableCell className="bg-gray-100 font-medium text-center">
                  {rowIdx + 1}
                </TableCell>
                {row.map((cell, colIdx) => (
                  <TableCell
                    key={colIdx}
                    className={`p-0 ${selectedCell?.row === rowIdx && selectedCell?.col === colIdx ? 'ring-2 ring-pharma-500' : ''}`}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                  >
                    {readOnly ? (
                      <div className="px-4 py-2 min-w-[100px]">
                        {typeof cell === 'number' ? cell.toFixed(2) : cell}
                      </div>
                    ) : (
                      <Cell
                        value={getCellValue(rowIdx, colIdx)}
                        onChange={(val) => handleCellChange(rowIdx, colIdx, val)}
                        formula={formulas[`${rowIdx},${colIdx}`]}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}