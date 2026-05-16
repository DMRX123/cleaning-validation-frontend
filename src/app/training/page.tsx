'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import toast from 'react-hot-toast'

interface TrainingModule {
  id: number
  module_code: string
  title: string
  description: string
  category: string
  version: number
  is_active: boolean
}

export default function TrainingPage() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const res = await api.get('/training/modules')
      setModules(res.data)
    } catch (error) {
      console.error('Failed to fetch training modules:', error)
      toast.error('Failed to load training modules')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, string> = {
      cleaning: 'bg-blue-100 text-blue-800',
      sampling: 'bg-green-100 text-green-800',
      analytical: 'bg-purple-100 text-purple-800',
      safety: 'bg-red-100 text-red-800'
    }
    return <Badge className={categories[category] || 'bg-gray-100 text-gray-800'}>{category.toUpperCase()}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-8 w-8 text-pharma-600" />
              <h1 className="text-2xl font-bold text-pharma-700">Training Management</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Section 9.8</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">Training Requirements</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Personnel involved in cleaning, sampling, and testing must be effectively trained
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Required Topics</p>
                      <ul className="text-xs text-green-700 mt-2 space-y-1 list-disc list-inside">
                        <li>Cleaning of equipment (manual/CIP)</li>
                        <li>Visual inspection of equipment</li>
                        <li>Sampling techniques (swab/rinse)</li>
                        <li>Analytical methods</li>
                        <li>Sanitization procedures</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Modules List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Training Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
                      </div>
                    ) : modules.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No training modules available.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Module Code</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {modules.map((module) => (
                            <TableRow key={module.id}>
                              <TableCell className="font-mono text-sm">{module.module_code}</TableCell>
                              <TableCell className="font-medium">{module.title}</TableCell>
                              <TableCell>{getCategoryBadge(module.category)}</TableCell>
                              <TableCell>v{module.version}</TableCell>
                              <TableCell>
                                <Badge variant={module.is_active ? 'success' : 'secondary'}>
                                  {module.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}