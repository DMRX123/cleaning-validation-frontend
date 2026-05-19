// src/app/(dashboard)/training/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Pencil, Trash2, GraduationCap, Loader2 } from 'lucide-react'
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

interface TrainingRecord {
  id: number
  user_id: number
  module_id: number
  training_date: string
  expiry_date: string | null
  trainer: string
  score: number | null
  is_passed: boolean
  username?: string
  module_title?: string
}

export default function TrainingPage() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [records, setRecords] = useState<TrainingRecord[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModuleDialog, setShowModuleDialog] = useState(false)
  const [showRecordDialog, setShowRecordDialog] = useState(false)
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null)
  const [moduleForm, setModuleForm] = useState({
    module_code: '',
    title: '',
    description: '',
    category: 'cleaning',
    version: 1,
  })
  const [recordForm, setRecordForm] = useState({
    user_id: 0,
    module_id: 0,
    training_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    trainer: '',
    score: 0,
    is_passed: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [modulesRes, recordsRes, usersRes] = await Promise.all([
        api.get('/training/modules/all'),
        api.get('/training/records'),
        api.get('/auth/users')
      ])
      setModules(modulesRes.data.modules || modulesRes.data || [])
      setRecords(recordsRes.data.records || recordsRes.data || [])
      setUsers(usersRes.data.users || [])
    } catch (error) {
      console.error('Failed to fetch training data:', error)
      toast.error('Failed to load training data')
    } finally {
      setLoading(false)
    }
  }

  const handleModuleSubmit = async () => {
    if (!moduleForm.module_code || !moduleForm.title) {
      toast.error('Module code and title are required')
      return
    }

    try {
      if (editingModule) {
        await api.put(`/training/modules/${editingModule.id}`, moduleForm)
        toast.success('Module updated')
      } else {
        await api.post('/training/modules', moduleForm)
        toast.success('Module created')
      }
      setShowModuleDialog(false)
      setEditingModule(null)
      setModuleForm({ module_code: '', title: '', description: '', category: 'cleaning', version: 1 })
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save module')
    }
  }

  const handleRecordSubmit = async () => {
    if (!recordForm.user_id || !recordForm.module_id || !recordForm.trainer) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      await api.post('/training/records', {
        ...recordForm,
        training_date: recordForm.training_date,
        expiry_date: recordForm.expiry_date || null,
      })
      toast.success('Training record added')
      setShowRecordDialog(false)
      setRecordForm({
        user_id: 0,
        module_id: 0,
        training_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        trainer: '',
        score: 0,
        is_passed: true,
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add record')
    }
  }

  const handleDeleteModule = async (id: number) => {
    if (confirm('Delete this module? This will also delete all associated records.')) {
      try {
        await api.delete(`/training/modules/${id}`)
        toast.success('Module deleted')
        fetchData()
      } catch (error) {
        toast.error('Failed to delete module')
      }
    }
  }

  const handleDeleteRecord = async (id: number) => {
    if (confirm('Delete this training record?')) {
      try {
        await api.delete(`/training/records/${id}`)
        toast.success('Record deleted')
        fetchData()
      } catch (error) {
        toast.error('Failed to delete record')
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
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
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="h-8 w-8 text-pharma-600" />
              <h1 className="text-2xl font-bold text-pharma-700">Training Management</h1>
            </div>

            <Tabs defaultValue="modules">
              <TabsList className="mb-6">
                <TabsTrigger value="modules">Training Modules</TabsTrigger>
                <TabsTrigger value="records">Training Records</TabsTrigger>
              </TabsList>

              <TabsContent value="modules">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Training Modules</CardTitle>
                    <Button onClick={() => setShowModuleDialog(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {modules.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No training modules. Click "Add Module" to create one.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Module Code</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Version</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
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
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      setEditingModule(module)
                                      setModuleForm({
                                        module_code: module.module_code,
                                        title: module.title,
                                        description: module.description || '',
                                        category: module.category,
                                        version: module.version,
                                      })
                                      setShowModuleDialog(true)
                                    }}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteModule(module.id)}>
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="records">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Training Records</CardTitle>
                    <Button onClick={() => setShowRecordDialog(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Record
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {records.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No training records. Click "Add Record" to create one.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Operator</TableHead>
                              <TableHead>Module</TableHead>
                              <TableHead>Training Date</TableHead>
                              <TableHead>Expiry Date</TableHead>
                              <TableHead>Trainer</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {records.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{record.username || `User ${record.user_id}`}</TableCell>
                                <TableCell>{record.module_title || `Module ${record.module_id}`}</TableCell>
                                <TableCell>{new Date(record.training_date).toLocaleDateString()}</TableCell>
                                <TableCell>{record.expiry_date ? new Date(record.expiry_date).toLocaleDateString() : '-'}</TableCell>
                                <TableCell>{record.trainer}</TableCell>
                                <TableCell>{record.score || '-'}</TableCell>
                                <TableCell>
                                  <Badge variant={record.is_passed ? 'success' : 'destructive'}>
                                    {record.is_passed ? 'Passed' : 'Failed'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Edit' : 'Add'} Training Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module-code">Module Code *</Label>
              <Input
                id="module-code"
                value={moduleForm.module_code}
                onChange={(e) => setModuleForm({ ...moduleForm, module_code: e.target.value })}
                placeholder="e.g., CLEAN-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-title">Title *</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="Module title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-description">Description</Label>
              <textarea
                id="module-description"
                className="w-full p-2 border rounded-md"
                rows={3}
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Module description (optional)"
                aria-label="Module Description"
                title="Module Description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module-category">Category</Label>
                <select
                  id="module-category"
                  className="w-full p-2 border rounded-md"
                  value={moduleForm.category}
                  onChange={(e) => setModuleForm({ ...moduleForm, category: e.target.value })}
                  aria-label="Module Category"
                  title="Module Category"
                >
                  <option value="cleaning">Cleaning</option>
                  <option value="sampling">Sampling</option>
                  <option value="analytical">Analytical</option>
                  <option value="safety">Safety</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-version">Version</Label>
                <Input
                  id="module-version"
                  type="number"
                  value={moduleForm.version}
                  onChange={(e) => setModuleForm({ ...moduleForm, version: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <Button onClick={handleModuleSubmit}>
              {editingModule ? 'Update' : 'Create'} Module
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Training Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="record-operator">Operator *</Label>
              <select
                id="record-operator"
                className="w-full p-2 border rounded-md"
                value={recordForm.user_id}
                onChange={(e) => setRecordForm({ ...recordForm, user_id: parseInt(e.target.value) })}
                aria-label="Select Operator"
                title="Select Operator"
              >
                <option value="">Select Operator</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="record-module">Module *</Label>
              <select
                id="record-module"
                className="w-full p-2 border rounded-md"
                value={recordForm.module_id}
                onChange={(e) => setRecordForm({ ...recordForm, module_id: parseInt(e.target.value) })}
                aria-label="Select Module"
                title="Select Module"
              >
                <option value="">Select Module</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>{module.title} ({module.module_code})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="training-date">Training Date *</Label>
                <Input
                  id="training-date"
                  type="date"
                  value={recordForm.training_date}
                  onChange={(e) => setRecordForm({ ...recordForm, training_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={recordForm.expiry_date}
                  onChange={(e) => setRecordForm({ ...recordForm, expiry_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trainer-name">Trainer *</Label>
              <Input
                id="trainer-name"
                value={recordForm.trainer}
                onChange={(e) => setRecordForm({ ...recordForm, trainer: e.target.value })}
                placeholder="Trainer name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score-value">Score (%)</Label>
                <Input
                  id="score-value"
                  type="number"
                  step="1"
                  value={recordForm.score}
                  onChange={(e) => setRecordForm({ ...recordForm, score: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="record-status">Status</Label>
                <select
                  id="record-status"
                  className="w-full p-2 border rounded-md"
                  value={recordForm.is_passed ? 'passed' : 'failed'}
                  onChange={(e) => setRecordForm({ ...recordForm, is_passed: e.target.value === 'passed' })}
                  aria-label="Training Status"
                  title="Training Status"
                >
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <Button onClick={handleRecordSubmit}>Add Record</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}