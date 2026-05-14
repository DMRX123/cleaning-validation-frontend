'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Download, Search } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

interface ValidationSession {
  id: number
  session_code: string
  status: string
  lowest_maco: number | null
  swab_limit_ppm: number | null
  created_at: string
  previous_product?: { name: string }
  next_product?: { name: string }
}

export default function ValidationHistoryPage() {
  const [sessions, setSessions] = useState<ValidationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await api.get('/validation/history')
      setSessions(res.data)
    } catch (error) {
      toast.error('Failed to fetch validation history')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (sessionId: number, sessionCode: string) => {
    try {
      const response = await api.get(`/reports/${sessionId}/pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `validation_report_${sessionCode}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Report downloaded')
    } catch (error) {
      toast.error('Failed to download report')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="warning">In Progress</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>
      case 'APPROVED':
        return <Badge variant="default">Approved</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredSessions = sessions.filter(s =>
    s.session_code.toLowerCase().includes(search.toLowerCase()) ||
    s.previous_product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.next_product?.name?.toLowerCase().includes(search.toLowerCase())
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
              <h1 className="text-2xl font-bold text-pharma-700">Validation History</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Past Validation Sessions</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by session code or product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : filteredSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No validation sessions found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session Code</TableHead>
                        <TableHead>Previous Product</TableHead>
                        <TableHead>Next Product</TableHead>
                        <TableHead>Lowest MACO (mg)</TableHead>
                        <TableHead>Swab Limit (ppm)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-mono text-sm">{session.session_code}</TableCell>
                          <TableCell>{session.previous_product?.name || 'N/A'}</TableCell>
                          <TableCell>{session.next_product?.name || 'N/A'}</TableCell>
                          <TableCell>{session.lowest_maco?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{session.swab_limit_ppm?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{getStatusBadge(session.status)}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(session.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/validation/${session.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => downloadReport(session.id, session.session_code)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
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