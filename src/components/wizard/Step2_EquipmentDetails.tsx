'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import api from '@/lib/api'

export function Step2_EquipmentDetails({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [equipment, setEquipment] = useState<any[]>([])
  const [selectedEquipments, setSelectedEquipments] = useState<number[]>(data.selectedEquipments || [])
  const [totalSurfaceArea, setTotalSurfaceArea] = useState(0)

  useEffect(() => {
    api.get('/equipment').then((res) => setEquipment(res.data))
  }, [])

  useEffect(() => {
    const selected = equipment.filter(e => selectedEquipments.includes(e.id))
    const total = selected.reduce((sum, e) => sum + e.surface_area, 0)
    setTotalSurfaceArea(total)
    onChange({ ...data, selectedEquipments, totalSurfaceArea })
  }, [selectedEquipments, equipment])

  const toggleEquipment = (id: number) => {
    setSelectedEquipments((prev: number[]) =>
      prev.includes(id) ? prev.filter((i: number) => i !== id) : [...prev, id]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Equipment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">Select</TableHead>
              <TableHead>Equipment Name</TableHead>
              <TableHead>Surface Area (m²)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((eq) => (
              <TableRow key={eq.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedEquipments.includes(eq.id)}
                    onChange={() => toggleEquipment(eq.id)}
                    className="h-4 w-4 rounded border-gray-300"
                    aria-label={`Select ${eq.name}`}
                    title={`Select ${eq.name}`}
                  />
                </TableCell>
                <TableCell>{eq.name}</TableCell>
                <TableCell>{eq.surface_area}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <span className="font-medium">Total Surface Area: {totalSurfaceArea.toFixed(2)} m²</span>
        </div>
      </CardContent>
    </Card>
  )
}

