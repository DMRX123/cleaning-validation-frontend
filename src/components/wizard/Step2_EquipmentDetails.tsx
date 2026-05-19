// src/components/wizard/Step2_EquipmentDetails.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

export function Step2_EquipmentDetails({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [equipment, setEquipment] = useState<any[]>([])
  const [selectedEquipments, setSelectedEquipments] = useState<number[]>(data.selectedEquipments || [])
  const [totalSurfaceArea, setTotalSurfaceArea] = useState(0)
  const [extraPercentage, setExtraPercentage] = useState(data.extraAreaPercentage || 0)

  useEffect(() => {
    api.get('/equipment').then((res) => setEquipment(res.data))
  }, [])

  useEffect(() => {
    const selected = equipment.filter(e => selectedEquipments.includes(e.id))
    let total = selected.reduce((sum, e) => sum + (e.surface_area || 0), 0)
    
    if (extraPercentage > 0) {
      total = total * (1 + extraPercentage / 100)
    }
    
    setTotalSurfaceArea(total)
    onChange({ ...data, selectedEquipments, totalSurfaceArea, extraAreaPercentage: extraPercentage })
  }, [selectedEquipments, equipment, extraPercentage])

  const toggleEquipment = (id: number) => {
    setSelectedEquipments((prev: number[]) =>
      prev.includes(id) ? prev.filter((i: number) => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEquipments(equipment.map(e => e.id))
    } else {
      setSelectedEquipments([])
    }
  }

  const isAllSelected = equipment.length > 0 && selectedEquipments.length === equipment.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Equipment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Extra Area Input */}
        <div className="space-y-2">
          <Label htmlFor="extra-area">Extra Surface Area (%)</Label>
          <Input
            id="extra-area"
            type="number"
            step="5"
            min={0}
            max={50}
            value={extraPercentage}
            onChange={(e) => setExtraPercentage(parseFloat(e.target.value) || 0)}
            placeholder="Add extra % for worst case (APIC Section 4.2.4)"
          />
          <p className="text-xs text-gray-500">
            Add extra surface area for worst case calculation. Common values: 10-20%
          </p>
        </div>

        {/* Equipment Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                      aria-label="Select all equipment"
                      title="Select all equipment"
                    />
                  </label>
                </TableHead>
                <TableHead>Equipment Name</TableHead>
                <TableHead>Equipment ID</TableHead>
                <TableHead>Surface Area (m²)</TableHead>
                <TableHead>Used For</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEquipments.includes(eq.id)}
                        onChange={() => toggleEquipment(eq.id)}
                        className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                        aria-label={`Select ${eq.name}`}
                        title={`Select ${eq.name}`}
                      />
                    </label>
                  </TableCell>
                  <TableCell className="font-medium">{eq.name}</TableCell>
                  <TableCell className="font-mono text-sm">{eq.equipment_id}</TableCell>
                  <TableCell>{eq.surface_area} m²</TableCell>
                  <TableCell>{eq.used_for}</TableCell>
                </TableRow>
              ))}
              {equipment.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No equipment found. Please add equipment first.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Total Surface Area Display */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Surface Area:</span>
            <span className="text-xl font-bold text-pharma-700">{totalSurfaceArea.toFixed(2)} m²</span>
          </div>
          {extraPercentage > 0 && (
            <div className="flex justify-between items-center mt-1 text-sm">
              <span className="text-gray-500">Including {extraPercentage}% extra:</span>
              <span className="text-pharma-600">+{(totalSurfaceArea - selectedEquipments.reduce((sum, id) => {
                const eq = equipment.find(e => e.id === id)
                return sum + (eq?.surface_area || 0)
              }, 0)).toFixed(2)} m²</span>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Total surface area affects MACO, swab limit, and rinse limit calculations.
            Select all equipment that will be cleaned in this validation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}