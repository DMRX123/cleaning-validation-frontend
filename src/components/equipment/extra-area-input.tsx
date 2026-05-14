'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface ExtraAreaInputProps {
  baseArea: number
  onExtraAreaChange: (extraPercentage: number, totalArea: number) => void
  label?: string
}

export function ExtraAreaInput({ baseArea, onExtraAreaChange, label = 'Extra Surface Area (%)' }: ExtraAreaInputProps) {
  const [extraPercentage, setExtraPercentage] = useState(0)
  const [totalArea, setTotalArea] = useState(baseArea)

  useEffect(() => {
    const calculatedTotal = baseArea + (baseArea * extraPercentage / 100)
    setTotalArea(calculatedTotal)
    onExtraAreaChange(extraPercentage, calculatedTotal)
  }, [extraPercentage, baseArea, onExtraAreaChange])

  const handleSliderChange = (value: number[]) => {
    setExtraPercentage(value[0])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value)
    if (isNaN(value)) value = 0
    if (value < 0) value = 0
    if (value > 100) value = 100
    setExtraPercentage(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Extra Percentage: {extraPercentage}%</Label>
          <Slider
            value={[extraPercentage]}
            onValueChange={handleSliderChange}
            min={0}
            max={50}
            step={5}
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Manual Entry (%)</Label>
            <Input
              type="number"
              value={extraPercentage}
              onChange={handleInputChange}
              min={0}
              max={100}
              step={5}
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Base Surface Area:</span>
            <span className="font-medium">{baseArea.toFixed(2)} m²</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Extra ({extraPercentage}%):</span>
            <span className="font-medium text-pharma-600">{(baseArea * extraPercentage / 100).toFixed(2)} m²</span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t">
            <span className="font-medium">Total Surface Area:</span>
            <span className="text-xl font-bold text-pharma-700">{totalArea.toFixed(2)} m²</span>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Add extra surface area for worst case calculation (ref. APIC Section 4.2.4)
        </div>
      </CardContent>
    </Card>
  )
}