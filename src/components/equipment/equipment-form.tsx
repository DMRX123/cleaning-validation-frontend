'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PLANTS, EQUIPMENT_TYPES } from '@/lib/constants'
import { useCreateEquipment, useUpdateEquipment } from '@/hooks/use-equipment'
import toast from 'react-hot-toast'

interface EquipmentFormProps {
  initialData?: any
  isEditing?: boolean
}

export function EquipmentForm({ initialData, isEditing }: EquipmentFormProps) {
  const router = useRouter()
  const createEquipment = useCreateEquipment()
  const updateEquipment = useUpdateEquipment()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    equipment_id: initialData?.equipment_id || '',
    capacity: initialData?.capacity || '',
    surface_area: initialData?.surface_area || '',
    used_for: initialData?.used_for || '',
    cleaning_procedure: initialData?.cleaning_procedure || '',
    plant: initialData?.plant || PLANTS[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data = {
      ...formData,
      capacity: formData.capacity ? parseFloat(formData.capacity as any) : null,
      surface_area: parseFloat(formData.surface_area as any),
    }

    try {
      if (isEditing && initialData?.id) {
        await updateEquipment.mutateAsync({ id: initialData.id, data })
      } else {
        await createEquipment.mutateAsync(data)
      }
      router.push('/equipment')
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Equipment' : 'Add New Equipment'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Equipment Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sifter, Granulator, Dryer"
              />
            </div>
            <div className="space-y-2">
              <Label>Equipment ID *</Label>
              <Input
                required
                value={formData.equipment_id}
                onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                placeholder="e.g., SH-01, GR-01"
              />
            </div>
            <div className="space-y-2">
              <Label>Capacity (kg or L)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label>Product Contact Surface Area (m²) *</Label>
              <Input
                type="number"
                step="0.1"
                required
                value={formData.surface_area}
                onChange={(e) => setFormData({ ...formData, surface_area: e.target.value })}
                placeholder="e.g., 4.0"
              />
            </div>
            <div className="space-y-2">
              <Label>Used For *</Label>
              <Select
                required
                value={formData.used_for}
                onChange={(e) => setFormData({ ...formData, used_for: e.target.value })}
              >
                <option value="">Select purpose</option>
                {EQUIPMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cleaning Procedure Reference</Label>
              <Input
                value={formData.cleaning_procedure}
                onChange={(e) => setFormData({ ...formData, cleaning_procedure: e.target.value })}
                placeholder="e.g., SOP-CLEAN-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Plant *</Label>
              <Select
                required
                value={formData.plant}
                onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
              >
                {PLANTS.map((plant) => (
                  <option key={plant} value={plant}>{plant}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Equipment' : 'Create Equipment')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/equipment')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}