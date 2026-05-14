'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { useEquipment, useDeleteEquipment } from '@/hooks/use-equipment'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function EquipmentList() {
  const router = useRouter()
  const { data: equipment, isLoading } = useEquipment()
  const deleteEquipment = useDeleteEquipment()
  const [search, setSearch] = useState('')
  const [plantFilter, setPlantFilter] = useState('')

  const filteredEquipment = equipment?.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(search.toLowerCase()) ||
                          eq.equipment_id.toLowerCase().includes(search.toLowerCase())
    const matchesPlant = !plantFilter || eq.plant === plantFilter
    return matchesSearch && matchesPlant
  }) || []

  const plants = [...new Set(equipment?.map(eq => eq.plant) || [])]

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      await deleteEquipment.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Equipment List</CardTitle>
          <Link href="/equipment/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </Link>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Search equipment"
            />
          </div>
          <select
            className="px-3 py-2 border rounded-md"
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
            aria-label="Filter by plant"
            title="Filter by plant"
          >
            <option value="">All Plants</option>
            {plants.map(plant => (
              <option key={plant} value={plant}>{plant}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment Name</TableHead>
              <TableHead>Equipment ID</TableHead>
              <TableHead>Surface Area (m²)</TableHead>
              <TableHead>Used For</TableHead>
              <TableHead>Plant</TableHead>
              <TableHead>Cleaning Procedure</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.map((eq) => (
              <TableRow key={eq.id}>
                <TableCell className="font-medium">{eq.name}</TableCell>
                <TableCell className="font-mono text-sm">{eq.equipment_id}</TableCell>
                <TableCell>{eq.surface_area}</TableCell>
                <TableCell>{eq.used_for}</TableCell>
                <TableCell>
                  <Badge variant="outline">{eq.plant}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{eq.cleaning_procedure}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/equipment/${eq.id}`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(eq.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
