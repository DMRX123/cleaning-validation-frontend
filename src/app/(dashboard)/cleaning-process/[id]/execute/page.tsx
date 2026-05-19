// src/app/(dashboard)/cleaning-process/[id]/execute/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function ExecuteCleaningProcessPage() {
  const params = useParams()
  const router = useRouter()
  const processId = params.id as string
  const [process, setProcess] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    executed_by: '',
    actual_temperature_c: '',
    actual_flow_rate_lpm: '',
    actual_pressure_bar: '',
    actual_duration_min: '',
    actual_concentration_percent: '',
    deviations: '',
    deviation_justification: '',
  })

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const res = await api.get(`/cleaning-process/${processId}`)
        setProcess(res.data.process || res.data)
      } catch (error) {
        console.error('Failed to fetch process:', error)
        toast.error('Failed to load process data')
        router.push('/cleaning-process')
      } finally {
        setLoading(false)
      }
    }
    fetchProcess()
  }, [processId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.executed_by) {
      toast.error('Please enter executor name')
      return
    }

    setSubmitting(true)
    try {
      const data = {
        process_id: parseInt(processId),
        executed_by: formData.executed_by,
        actual_temperature_c: formData.actual_temperature_c ? parseFloat(formData.actual_temperature_c) : null,
        actual_flow_rate_lpm: formData.actual_flow_rate_lpm ? parseFloat(formData.actual_flow_rate_lpm) : null,
        actual_pressure_bar: formData.actual_pressure_bar ? parseFloat(formData.actual_pressure_bar) : null,
        actual_duration_min: formData.actual_duration_min ? parseFloat(formData.actual_duration_min) : null,
        actual_concentration_percent: formData.actual_concentration_percent ? parseFloat(formData.actual_concentration_percent) : null,
        deviations: formData.deviations || null,
        deviation_justification: formData.deviation_justification || null,
      }
      
      await api.post('/cleaning-process/execute', data)
      toast.success('Execution recorded successfully')
      router.push(`/cleaning-process/${processId}`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to record execution')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!process) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Process not found</p>
          <Button onClick={() => router.push('/cleaning-process')} className="mt-4">Back</Button>
        </div>
      </div>
    )
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
                <CardTitle>Record Cleaning Execution</CardTitle>
                <p className="text-sm text-gray-500">
                  Process: {process.name} ({process.process_code})
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Executed By *</Label>
                    <Input
                      required
                      placeholder="Your name"
                      value={formData.executed_by}
                      onChange={(e) => setFormData({ ...formData, executed_by: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Actual Temperature (°C)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder={process.min_temperature_c ? `${process.min_temperature_c} - ${process.max_temperature_c}` : "Temperature"}
                        value={formData.actual_temperature_c}
                        onChange={(e) => setFormData({ ...formData, actual_temperature_c: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Actual Flow Rate (L/min)</Label>
                      <Input
                        type="number"
                        step="1"
                        placeholder={process.min_flow_rate_lpm ? `${process.min_flow_rate_lpm} - ${process.max_flow_rate_lpm}` : "Flow rate"}
                        value={formData.actual_flow_rate_lpm}
                        onChange={(e) => setFormData({ ...formData, actual_flow_rate_lpm: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Actual Pressure (bar)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder={process.min_pressure_bar ? `${process.min_pressure_bar} - ${process.max_pressure_bar}` : "Pressure"}
                        value={formData.actual_pressure_bar}
                        onChange={(e) => setFormData({ ...formData, actual_pressure_bar: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Actual Duration (minutes)</Label>
                      <Input
                        type="number"
                        step="1"
                        placeholder={process.min_duration_min ? `${process.min_duration_min} - ${process.max_duration_min}` : "Duration"}
                        value={formData.actual_duration_min}
                        onChange={(e) => setFormData({ ...formData, actual_duration_min: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Deviations (if any)</Label>
                    <Textarea
                      rows={3}
                      placeholder="Describe any deviations from the standard cleaning procedure..."
                      value={formData.deviations}
                      onChange={(e) => setFormData({ ...formData, deviations: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Deviation Justification</Label>
                    <Textarea
                      rows={2}
                      placeholder="Justification for any deviations..."
                      value={formData.deviation_justification}
                      onChange={(e) => setFormData({ ...formData, deviation_justification: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Recording...' : 'Record Execution'}
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