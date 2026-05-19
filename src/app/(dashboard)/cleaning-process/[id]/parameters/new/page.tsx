// src/app/(dashboard)/cleaning-process/[id]/parameters/new/page.tsx
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function AddParameterPage() {
  const params = useParams()
  const router = useRouter()
  const processId = params.id as string
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    parameter_name: '',
    parameter_unit: '',
    target_value: '',
    min_acceptable: '',
    max_acceptable: '',
    is_critical: true,
    is_controlled_automatically: false,
    measurement_method: '',
    measurement_frequency: '',
  })

  const handleCheckboxChange = (field: keyof typeof formData, checked: boolean) => {
    setFormData({ ...formData, [field]: checked })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.parameter_name || !formData.parameter_unit || !formData.min_acceptable || !formData.max_acceptable) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      await api.post(`/cleaning-process/${processId}/parameters`, {
        parameter_name: formData.parameter_name,
        parameter_unit: formData.parameter_unit,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        min_acceptable: parseFloat(formData.min_acceptable),
        max_acceptable: parseFloat(formData.max_acceptable),
        is_critical: formData.is_critical,
        is_controlled_automatically: formData.is_controlled_automatically,
        measurement_method: formData.measurement_method || null,
        measurement_frequency: formData.measurement_frequency || null,
      })
      toast.success('Parameter added successfully')
      router.push(`/cleaning-process/${processId}`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add parameter')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Add Critical Parameter</CardTitle>
                <p className="text-sm text-gray-500">Add a critical parameter to the cleaning process</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parameter-name">Parameter Name *</Label>
                      <Input
                        id="parameter-name"
                        required
                        placeholder="e.g., Temperature, Flow Rate, Pressure"
                        value={formData.parameter_name}
                        onChange={(e) => setFormData({ ...formData, parameter_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parameter-unit">Parameter Unit *</Label>
                      <Input
                        id="parameter-unit"
                        required
                        placeholder="e.g., °C, L/min, bar, min"
                        value={formData.parameter_unit}
                        onChange={(e) => setFormData({ ...formData, parameter_unit: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-acceptable">Min Acceptable *</Label>
                      <Input
                        id="min-acceptable"
                        type="number"
                        step="any"
                        required
                        placeholder="Minimum value"
                        value={formData.min_acceptable}
                        onChange={(e) => setFormData({ ...formData, min_acceptable: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target-value">Target Value</Label>
                      <Input
                        id="target-value"
                        type="number"
                        step="any"
                        placeholder="Target value (optional)"
                        value={formData.target_value}
                        onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-acceptable">Max Acceptable *</Label>
                      <Input
                        id="max-acceptable"
                        type="number"
                        step="any"
                        required
                        placeholder="Maximum value"
                        value={formData.max_acceptable}
                        onChange={(e) => setFormData({ ...formData, max_acceptable: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="measurement-method">Measurement Method</Label>
                      <Input
                        id="measurement-method"
                        placeholder="e.g., Thermocouple, Flow meter, Pressure gauge"
                        value={formData.measurement_method}
                        onChange={(e) => setFormData({ ...formData, measurement_method: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="measurement-frequency">Measurement Frequency</Label>
                      <Input
                        id="measurement-frequency"
                        placeholder="e.g., Every batch, Daily, Weekly"
                        value={formData.measurement_frequency}
                        onChange={(e) => setFormData({ ...formData, measurement_frequency: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_critical}
                        onChange={(e) => handleCheckboxChange('is_critical', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                        aria-label="Critical Parameter"
                        title="Critical Parameter"
                      />
                      <span className="text-sm">Critical Parameter (affects cleaning effectiveness)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_controlled_automatically}
                        onChange={(e) => handleCheckboxChange('is_controlled_automatically', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                        aria-label="Automatically Controlled"
                        title="Automatically Controlled"
                      />
                      <span className="text-sm">Automatically Controlled (CIP system)</span>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Parameter'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push(`/cleaning-process/${processId}`)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}