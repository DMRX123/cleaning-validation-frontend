'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import toast from 'react-hot-toast'

export default function NewChangeControlPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'cleaning_procedure',
    description: '',
    reason: '',
    impact_on_cleaning: '',
    impact_on_validation: '',
    risk_assessment: '',
    proposed_by: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.reason || !formData.proposed_by) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      await api.post('/change-control', formData)
      toast.success('Change request submitted successfully')
      router.push('/change-control')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit change request')
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
                <CardTitle>Propose Change Request</CardTitle>
                <p className="text-sm text-gray-500">Section 10.0 - Changes requiring revalidation assessment</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Change Title *</Label>
                    <Input
                      required
                      placeholder="e.g., Cleaning procedure modification for Reactor R-101"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Change Type *</Label>
                      <Select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="cleaning_procedure">Cleaning Procedure</option>
                        <option value="equipment">Equipment Modification</option>
                        <option value="product">New Product Introduction</option>
                        <option value="analytical_method">Analytical Method</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Proposed By *</Label>
                      <Input
                        required
                        placeholder="Your name"
                        value={formData.proposed_by}
                        onChange={(e) => setFormData({ ...formData, proposed_by: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description of Change *</Label>
                    <Textarea
                      required
                      rows={3}
                      placeholder="Detailed description of the proposed change..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reason for Change *</Label>
                    <Textarea
                      required
                      rows={2}
                      placeholder="Why is this change needed?"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Impact on Cleaning</Label>
                    <Textarea
                      rows={2}
                      placeholder="How will this affect the cleaning process?"
                      value={formData.impact_on_cleaning}
                      onChange={(e) => setFormData({ ...formData, impact_on_cleaning: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Impact on Validation</Label>
                    <Textarea
                      rows={2}
                      placeholder="Does this change affect validation status?"
                      value={formData.impact_on_validation}
                      onChange={(e) => setFormData({ ...formData, impact_on_validation: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Risk Assessment</Label>
                    <Textarea
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
                      {loading ? 'Submitting...' : 'Submit Change Request'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push('/change-control')}>
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