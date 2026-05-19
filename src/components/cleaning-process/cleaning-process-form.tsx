// src/components/cleaning-process/CleaningProcessForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface CleaningProcessFormProps {
  initialData?: any
  isEditing?: boolean
}

export function CleaningProcessForm({ initialData, isEditing }: CleaningProcessFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    process_code: initialData?.process_code || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    cleaning_type: initialData?.cleaning_type || 'manual',
    sop_reference: initialData?.sop_reference || '',
    sop_version: initialData?.sop_version || '',
    min_temperature_c: initialData?.min_temperature_c?.toString() || '',
    max_temperature_c: initialData?.max_temperature_c?.toString() || '',
    min_flow_rate_lpm: initialData?.min_flow_rate_lpm?.toString() || '',
    max_flow_rate_lpm: initialData?.max_flow_rate_lpm?.toString() || '',
    min_pressure_bar: initialData?.min_pressure_bar?.toString() || '',
    max_pressure_bar: initialData?.max_pressure_bar?.toString() || '',
    min_duration_min: initialData?.min_duration_min?.toString() || '',
    max_duration_min: initialData?.max_duration_min?.toString() || '',
    training_required: initialData?.training_required ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.process_code || !formData.name) {
      toast.error('Process Code and Name are required')
      return
    }

    setLoading(true)
    try {
      const data = {
        process_code: formData.process_code,
        name: formData.name,
        description: formData.description,
        cleaning_type: formData.cleaning_type,
        sop_reference: formData.sop_reference || null,
        sop_version: formData.sop_version || null,
        min_temperature_c: formData.min_temperature_c ? parseFloat(formData.min_temperature_c) : null,
        max_temperature_c: formData.max_temperature_c ? parseFloat(formData.max_temperature_c) : null,
        min_flow_rate_lpm: formData.min_flow_rate_lpm ? parseFloat(formData.min_flow_rate_lpm) : null,
        max_flow_rate_lpm: formData.max_flow_rate_lpm ? parseFloat(formData.max_flow_rate_lpm) : null,
        min_pressure_bar: formData.min_pressure_bar ? parseFloat(formData.min_pressure_bar) : null,
        max_pressure_bar: formData.max_pressure_bar ? parseFloat(formData.max_pressure_bar) : null,
        min_duration_min: formData.min_duration_min ? parseFloat(formData.min_duration_min) : null,
        max_duration_min: formData.max_duration_min ? parseFloat(formData.max_duration_min) : null,
        training_required: formData.training_required,
      }
      
      if (isEditing && initialData?.id) {
        await api.put(`/cleaning-process/${initialData.id}`, data)
        toast.success('Cleaning process updated successfully')
      } else {
        await api.post('/cleaning-process/create', data)
        toast.success('Cleaning process created successfully')
      }
      router.push('/cleaning-process')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save process')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Cleaning Process' : 'Create Cleaning Process'}</CardTitle>
        <p className="text-sm text-gray-500">Section 6.0 - Control of Cleaning Process</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="process-code">Process Code *</Label>
              <Input
                id="process-code"
                required
                placeholder="e.g., CLEAN-API-001"
                value={formData.process_code}
                onChange={(e) => setFormData({ ...formData, process_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="process-name">Process Name *</Label>
              <Input
                id="process-name"
                required
                placeholder="e.g., API Reactor Cleaning"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="process-description">Description</Label>
            <Textarea
              id="process-description"
              placeholder="Describe the cleaning process..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cleaning-type">Cleaning Type *</Label>
              <select
                id="cleaning-type"
                className="w-full p-2 border rounded-md"
                value={formData.cleaning_type}
                onChange={(e) => setFormData({ ...formData, cleaning_type: e.target.value })}
                aria-label="Cleaning Type"
                title="Cleaning Type"
              >
                <option value="manual">Manual Cleaning</option>
                <option value="automated_cip">Automated CIP</option>
                <option value="automated_cop">Automated COP</option>
                <option value="semi_automated">Semi-Automated</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sop-reference">SOP Reference</Label>
              <Input
                id="sop-reference"
                placeholder="e.g., SOP-CLEAN-001"
                value={formData.sop_reference}
                onChange={(e) => setFormData({ ...formData, sop_reference: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Critical Parameter Limits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temp-min">Temperature Min (°C)</Label>
                <Input
                  id="temp-min"
                  type="number"
                  step="1"
                  placeholder="e.g., 20"
                  value={formData.min_temperature_c}
                  onChange={(e) => setFormData({ ...formData, min_temperature_c: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp-max">Temperature Max (°C)</Label>
                <Input
                  id="temp-max"
                  type="number"
                  step="1"
                  placeholder="e.g., 80"
                  value={formData.max_temperature_c}
                  onChange={(e) => setFormData({ ...formData, max_temperature_c: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flow-min">Flow Rate Min (L/min)</Label>
                <Input
                  id="flow-min"
                  type="number"
                  step="10"
                  placeholder="e.g., 100"
                  value={formData.min_flow_rate_lpm}
                  onChange={(e) => setFormData({ ...formData, min_flow_rate_lpm: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flow-max">Flow Rate Max (L/min)</Label>
                <Input
                  id="flow-max"
                  type="number"
                  step="10"
                  placeholder="e.g., 500"
                  value={formData.max_flow_rate_lpm}
                  onChange={(e) => setFormData({ ...formData, max_flow_rate_lpm: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pressure-min">Pressure Min (bar)</Label>
                <Input
                  id="pressure-min"
                  type="number"
                  step="0.5"
                  placeholder="e.g., 2"
                  value={formData.min_pressure_bar}
                  onChange={(e) => setFormData({ ...formData, min_pressure_bar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pressure-max">Pressure Max (bar)</Label>
                <Input
                  id="pressure-max"
                  type="number"
                  step="0.5"
                  placeholder="e.g., 6"
                  value={formData.max_pressure_bar}
                  onChange={(e) => setFormData({ ...formData, max_pressure_bar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration-min">Duration Min (minutes)</Label>
                <Input
                  id="duration-min"
                  type="number"
                  step="5"
                  placeholder="e.g., 15"
                  value={formData.min_duration_min}
                  onChange={(e) => setFormData({ ...formData, min_duration_min: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration-max">Duration Max (minutes)</Label>
                <Input
                  id="duration-max"
                  type="number"
                  step="5"
                  placeholder="e.g., 60"
                  value={formData.max_duration_min}
                  onChange={(e) => setFormData({ ...formData, max_duration_min: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Process' : 'Create Process')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/cleaning-process')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}