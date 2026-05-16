'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import toast from 'react-hot-toast'

interface CleaningProcess {
  id: number
  process_code: string
  name: string
  cleaning_type: string
  is_validated: boolean
  is_active: boolean
  created_at: string
}

export default function CleaningProcessPage() {
  const [processes, setProcesses] = useState<CleaningProcess[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProcesses()
  }, [])

  const fetchProcesses = async () => {
    try {
      const res = await api.get('/cleaning-process')
      setProcesses(res.data)
    } catch (error) {
      console.error('Failed to fetch processes:', error)
      toast.error('Failed to load cleaning processes')
    } finally {
      setLoading(false)
    }
  }

  const getCleaningTypeClass = (type: string): string => {
    const types: Record<string, string> = {
      manual: 'bg-purple-100 text-purple-800',
      automated_cip: 'bg-blue-100 text-blue-800',
      automated_cop: 'bg-green-100 text-green-800',
      semi_automated: 'bg-yellow-100 text-yellow-800'
    }
    return types[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-pharma-700">Cleaning Processes</h1>
              <Link href="/cleaning-process/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Process
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cleaning Process Definitions</CardTitle>
                <p className="text-sm text-gray-500">Section 6.0 - Control of Cleaning Process</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
                  </div>
                ) : processes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No cleaning processes defined. Click "Create Process" to start.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Process Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Cleaning Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Validation</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processes.map((process) => (
                        <TableRow key={process.id}>
                          <TableCell className="font-mono text-sm">{process.process_code}</TableCell>
                          <TableCell className="font-medium">{process.name}</TableCell>
                          <TableCell>
                            <Badge className={getCleaningTypeClass(process.cleaning_type)}>
                              {process.cleaning_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={process.is_active ? 'success' : 'secondary'}>
                              {process.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={process.is_validated ? 'success' : 'warning'}>
                              {process.is_validated ? 'Validated' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(process.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/cleaning-process/${process.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/cleaning-process/${process.id}/capability`}>
                                <Button variant="ghost" size="sm">
                                  <TrendingUp className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
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