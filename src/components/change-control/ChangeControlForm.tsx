// src/components/change-control/ChangeControlForm.tsx
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

interface ChangeControlFormProps {
  initialData?: any
  isEditing?: boolean
}

export function ChangeControlForm({ initialData, isEditing }: ChangeControlFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    type: initialData?.type || 'cleaning_procedure',
    description: initialData?.description || '',
    reason: initialData?.reason || '',
    impact_on_cleaning: initialData?.impact_on_cleaning || '',
    impact_on_validation: initialData?.impact_on_validation || '',
    risk_assessment: initialData?.risk_assessment || '',
    proposed_by: initialData?.proposed_by || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.reason || !formData.proposed_by) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/crud/change-controls/${initialData.id}`, formData)
        toast.success('Change request updated successfully')
      } else {
        await api.post('/crud/change-controls', formData)
        toast.success('Change request submitted successfully')
      }
      router.push('/change-control')
    } catch (error: any) {
      console.error('Submit error:', error.response?.data)
      
      // Handle validation errors properly
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        if (Array.isArray(detail)) {
          detail.forEach((err: any) => {
            const field = err.loc?.pop() || 'unknown'
            toast.error(`${field}: ${err.msg}`)
          })
        } else if (typeof detail === 'string') {
          toast.error(detail)
        } else {
          toast.error('Validation failed')
        }
      } else {
        toast.error('Failed to submit change request')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Change Request' : 'Propose Change Request'}</CardTitle>
        <p className="text-sm text-gray-500">Section 10.0 - Changes requiring revalidation assessment</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="change-title">Change Title *</Label>
            <Input
              id="change-title"
              required
              placeholder="e.g., Cleaning procedure modification for Reactor R-101"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="change-type">Change Type *</Label>
              <select
                id="change-type"
                className="w-full p-2 border rounded-md"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                aria-label="Change Type"
                title="Change Type"
              >
                <option value="cleaning_procedure">Cleaning Procedure</option>
                <option value="equipment">Equipment Modification</option>
                <option value="product">New Product Introduction</option>
                <option value="analytical_method">Analytical Method</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposed-by">Proposed By *</Label>
              <Input
                id="proposed-by"
                required
                placeholder="Your name"
                value={formData.proposed_by}
                onChange={(e) => setFormData({ ...formData, proposed_by: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="change-description">Description of Change *</Label>
            <Textarea
              id="change-description"
              required
              rows={3}
              placeholder="Detailed description of the proposed change..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="change-reason">Reason for Change *</Label>
            <Textarea
              id="change-reason"
              required
              rows={2}
              placeholder="Why is this change needed?"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact-cleaning">Impact on Cleaning</Label>
            <Textarea
              id="impact-cleaning"
              rows={2}
              placeholder="How will this affect the cleaning process?"
              value={formData.impact_on_cleaning}
              onChange={(e) => setFormData({ ...formData, impact_on_cleaning: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact-validation">Impact on Validation</Label>
            <Textarea
              id="impact-validation"
              rows={2}
              placeholder="Does this change affect validation status?"
              value={formData.impact_on_validation}
              onChange={(e) => setFormData({ ...formData, impact_on_validation: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk-assessment">Risk Assessment</Label>
            <Textarea
              id="risk-assessment"
              rows={2}
              placeholder="Risk assessment for this change..."
              value={formData.risk_assessment}
              onChange={(e) => setFormData({ ...formData, risk_assessment: e.target.value })}
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Changes to cleaning procedures, equipment, or products may require revalidation.
              The system will automatically assess if revalidation is needed.
            </p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : (isEditing ? 'Update Change Request' : 'Submit Change Request')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/change-control')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}