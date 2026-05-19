// src/app/(dashboard)/change-control/[id]/approve/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function ApproveChangeControlPage() {
  const params = useParams()
  const router = useRouter()
  const changeId = params.id as string
  const [change, setChange] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null)
  const [comments, setComments] = useState('')

  useEffect(() => {
    fetchChange()
  }, [changeId])

  const fetchChange = async () => {
    try {
      const res = await api.get(`/change-control/${changeId}`)
      setChange(res.data)
    } catch (error) {
      toast.error('Failed to load change request')
      router.push('/change-control')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!decision) {
      toast.error('Please select Approve or Reject')
      return
    }

    setSubmitting(true)
    try {
      const status = decision === 'approve' ? 'APPROVED' : 'REJECTED'
      await api.put(`/change-control/${changeId}/status`, {
        status,
        reviewed_by: 'Reviewer',
        comments,
      })
      toast.success(`Change request ${status.toLowerCase()}`)
      router.push('/change-control')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to process request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
      </div>
    )
  }

  if (!change) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Change request not found</p>
          <Button onClick={() => router.push('/change-control')} className="mt-4">Back</Button>
        </div>
      </div>
    )
  }

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      cleaning_procedure: 'bg-purple-100 text-purple-800',
      equipment: 'bg-blue-100 text-blue-800',
      product: 'bg-green-100 text-green-800',
      analytical_method: 'bg-orange-100 text-orange-800',
    }
    return <Badge className={types[type] || 'bg-gray-100 text-gray-800'}>{type?.replace('_', ' ').toUpperCase()}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Review Change Request</CardTitle>
                <p className="text-sm text-gray-500">
                  Change #{change.change_number} - {change.title}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Change Type</p>
                    {getTypeBadge(change.type)}
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Proposed By</p>
                    <p className="font-medium">{change.proposed_by}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Proposed Date</p>
                    <p>{new Date(change.proposed_date).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Revalidation Required</p>
                    <Badge variant={change.revalidation_required ? 'warning' : 'success'}>
                      {change.revalidation_required ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm mt-1">{change.description}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="text-sm mt-1">{change.reason}</p>
                </div>

                {change.impact_on_cleaning && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Impact on Cleaning</p>
                    <p className="text-sm mt-1">{change.impact_on_cleaning}</p>
                  </div>
                )}

                {change.impact_on_validation && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Impact on Validation</p>
                    <p className="text-sm mt-1">{change.impact_on_validation}</p>
                  </div>
                )}

                {change.risk_assessment && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Risk Assessment</p>
                    <p className="text-sm mt-1">{change.risk_assessment}</p>
                  </div>
                )}

                {/* Decision Section */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Make Decision</h3>
                  
                  <div className="flex gap-4 mb-4">
                    <Button
                      type="button"
                      variant={decision === 'approve' ? 'default' : 'outline'}
                      className={decision === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => setDecision('approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant={decision === 'reject' ? 'destructive' : 'outline'}
                      onClick={() => setDecision('reject')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Review Comments</Label>
                    <Textarea
                      rows={4}
                      placeholder="Add your comments, justification, or conditions for approval..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    />
                  </div>

                  {decision === 'approve' && change.revalidation_required && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Revalidation Required</p>
                        <p className="text-xs mt-1">
                          This change requires revalidation. Please ensure a validation protocol is created
                          and executed before implementation.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <Button onClick={handleSubmit} disabled={submitting || !decision}>
                      {submitting ? 'Processing...' : 'Submit Decision'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push('/change-control')}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}