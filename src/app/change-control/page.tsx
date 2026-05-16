'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, CheckCircle, XCircle, Loader2, Search } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import toast from 'react-hot-toast'

interface ChangeControl {
  id: number
  change_number: string
  title: string
  type: string
  status: string
  proposed_by: string
  proposed_date: string
  revalidation_required: boolean
  revalidation_completed: boolean
}

export default function ChangeControlPage() {
  const [changes, setChanges] = useState<ChangeControl[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchChanges()
  }, [])

  const fetchChanges = async () => {
    try {
      const res = await api.get('/change-control')
      setChanges(res.data)
    } catch (error) {
      console.error('Failed to fetch change controls:', error)
      toast.error('Failed to load change controls')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PROPOSED: { label: 'Proposed', className: 'bg-yellow-100 text-yellow-800' },
      REVIEW: { label: 'In Review', className: 'bg-blue-100 text-blue-800' },
      APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-800' },
      IMPLEMENTED: { label: 'Implemented', className: 'bg-purple-100 text-purple-800' },
      CLOSED: { label: 'Closed', className: 'bg-gray-100 text-gray-800' },
      REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800' }
    }
    const info = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return <Badge className={info.className}>{info.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      cleaning_procedure: 'bg-purple-100 text-purple-800',
      equipment: 'bg-blue-100 text-blue-800',
      product: 'bg-green-100 text-green-800',
      analytical_method: 'bg-orange-100 text-orange-800'
    }
    return <Badge className={typeMap[type] || 'bg-gray-100 text-gray-800'}>{type.replace('_', ' ').toUpperCase()}</Badge>
  }

  const filteredChanges = changes.filter(c =>
    c.change_number.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-pharma-700">Change Control</h1>
                <p className="text-sm text-gray-500">Section 10.0 - Revalidation and Change Control</p>
              </div>
              <Link href="/change-control/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Propose Change
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Change Requests</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by change number or title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
                  </div>
                ) : filteredChanges.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No change requests found. Click "Propose Change" to create one.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Change Number</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Revalidation</TableHead>
                        <TableHead>Proposed By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChanges.map((change) => (
                        <TableRow key={change.id}>
                          <TableCell className="font-mono text-sm">{change.change_number}</TableCell>
                          <TableCell className="font-medium">{change.title}</TableCell>
                          <TableCell>{getTypeBadge(change.type)}</TableCell>
                          <TableCell>{getStatusBadge(change.status)}</TableCell>
                          <TableCell>
                            {change.revalidation_required ? (
                              change.revalidation_completed ? (
                                <Badge variant="success">Completed</Badge>
                              ) : (
                                <Badge variant="warning">Required</Badge>
                              )
                            ) : (
                              <Badge variant="outline">Not Required</Badge>
                            )}
                          </TableCell>
                          <TableCell>{change.proposed_by}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(change.proposed_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Link href={`/change-control/${change.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}