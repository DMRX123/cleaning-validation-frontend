'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import toast from 'react-hot-toast'

export default function ChangeControlDetailPage() {
  const params = useParams()
  const router = useRouter()
  const changeId = params.id as string
  const [change, setChange] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChange()
  }, [changeId])

  const fetchChange = async () => {
    try {
      const res = await api.get(`/change-control/${changeId}`)
      setChange(res.data)
    } catch (error) {
      toast.error('Failed to load change request')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/change-control/${changeId}/status`, { status })
      toast.success(`Change request ${status.toLowerCase()}`)
      fetchChange()
    } catch (error) {
      toast.error('Failed to update status')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'IMPLEMENTED': return 'bg-purple-100 text-purple-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/change-control">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-pharma-700">{change.title}</h1>
              <Badge className={getStatusColor(change.status)}>
                {change.status}
              </Badge>
            </div>

            <Tabs defaultValue="details">
              <TabsList className="mb-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="impact">Impact Assessment</TabsTrigger>
                <TabsTrigger value="approval">Approval</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Change Number</p>
                        <p className="font-mono">{change.change_number}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Change Type</p>
                        <p className="font-medium">{change.type?.replace('_', ' ').toUpperCase()}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Proposed By</p>
                        <p>{change.proposed_by}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Proposed Date</p>
                        <p>{new Date(change.proposed_date).toLocaleString()}</p>
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="impact">
                <Card>
                  <CardHeader>
                    <CardTitle>Impact Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-yellow-50 rounded">
                      <p className="text-sm font-medium text-yellow-800">Revalidation Required</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {change.revalidation_required ? 'Yes - This change requires revalidation' : 'No - Revalidation not required'}
                      </p>
                      {change.revalidation_required && (
                        <div className="mt-2">
                          <Badge variant={change.revalidation_completed ? 'success' : 'warning'}>
                            {change.revalidation_completed ? 'Revalidation Completed' : 'Revalidation Pending'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Impact on Cleaning</p>
                      <p className="text-sm mt-1">{change.impact_on_cleaning || 'Not specified'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Impact on Validation</p>
                      <p className="text-sm mt-1">{change.impact_on_validation || 'Not specified'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">Risk Assessment</p>
                      <p className="text-sm mt-1">{change.risk_assessment || 'Not specified'}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="approval">
                <Card>
                  <CardHeader>
                    <CardTitle>Approval Workflow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Reviewed By</p>
                        <p>{change.reviewed_by || 'Pending'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Review Date</p>
                        <p>{change.reviewed_date ? new Date(change.reviewed_date).toLocaleString() : 'Pending'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Approved By</p>
                        <p>{change.approved_by || 'Pending'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Approval Date</p>
                        <p>{change.approved_date ? new Date(change.approved_date).toLocaleString() : 'Pending'}</p>
                      </div>
                    </div>
                    {change.closure_notes && (
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Closure Notes</p>
                        <p className="text-sm mt-1">{change.closure_notes}</p>
                      </div>
                    )}
                    <div className="flex gap-4 pt-4">
                      {change.status === 'PROPOSED' && (
                        <>
                          <Button onClick={() => updateStatus('APPROVED')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button variant="destructive" onClick={() => updateStatus('REJECTED')}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {change.status === 'APPROVED' && (
                        <Button onClick={() => updateStatus('IMPLEMENTED')}>
                          Mark as Implemented
                        </Button>
                      )}
                      {change.status === 'IMPLEMENTED' && (
                        <Button onClick={() => updateStatus('CLOSED')}>
                          Close Change Request
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}