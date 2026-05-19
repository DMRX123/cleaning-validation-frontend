// src/components/operator-qualification/OperatorQualificationManager.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GraduationCap, Plus, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react'
import { useOperatorQualifications, useCreateOperatorQualification, useUpdateOperatorQualification, useDeleteOperatorQualification } from '@/hooks/useOperatorQualification'
import { useUsers } from '@/hooks/useUsers'
import toast from 'react-hot-toast'

export function OperatorQualificationManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    user_id: 0,
    qualified_by: '',
    eyesight_certified: false,
    color_blindness_test_passed: false,
    training_completed: false,
    practical_demo_passed: false,
  })

  const { data: qualifications, refetch } = useOperatorQualifications()
  const { data: users } = useUsers()
  const createQual = useCreateOperatorQualification()
  const updateQual = useUpdateOperatorQualification()
  const deleteQual = useDeleteOperatorQualification()

  const handleCheckboxChange = (field: keyof typeof formData, checked: boolean | string) => {
    setFormData({ ...formData, [field]: checked === true })
  }

  const handleSubmit = async () => {
    if (!formData.user_id || !formData.qualified_by) {
      toast.error('Please select user and enter qualified by name')
      return
    }

    if (editingId) {
      await updateQual.mutateAsync({ id: editingId, data: formData })
    } else {
      await createQual.mutateAsync(formData)
    }
    
    setIsDialogOpen(false)
    setEditingId(null)
    setFormData({
      user_id: 0,
      qualified_by: '',
      eyesight_certified: false,
      color_blindness_test_passed: false,
      training_completed: false,
      practical_demo_passed: false,
    })
    refetch()
  }

  const handleEdit = (qual: any) => {
    setEditingId(qual.id)
    setFormData({
      user_id: qual.user_id,
      qualified_by: qual.qualified_by || '',
      eyesight_certified: qual.eyesight_certified,
      color_blindness_test_passed: qual.color_blindness_test_passed,
      training_completed: qual.training_completed,
      practical_demo_passed: qual.practical_demo_passed,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this qualification record?')) {
      await deleteQual.mutateAsync(id)
      refetch()
    }
  }

  const isQualified = (qual: any) => {
    return qual.eyesight_certified && 
           qual.color_blindness_test_passed && 
           qual.training_completed && 
           qual.practical_demo_passed
  }

  const isExpiringSoon = (validUntil: string) => {
    if (!validUntil) return false
    const expiryDate = new Date(validUntil)
    const today = new Date()
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return daysLeft <= 30 && daysLeft > 0
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-pharma-600" />
            Operator Qualification (Section 9.8 & 11)
          </CardTitle>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Qualification
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operator</TableHead>
                  <TableHead className="text-center">Eyesight</TableHead>
                  <TableHead className="text-center">Color Vision</TableHead>
                  <TableHead className="text-center">Training</TableHead>
                  <TableHead className="text-center">Practical Demo</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualifications?.map((qual) => {
                  const qualified = isQualified(qual)
                  const expiring = isExpiringSoon(qual.qualification_valid_until || '')
                  return (
                    <TableRow key={qual.id}>
                      <TableCell className="font-medium">{qual.username || `User ${qual.user_id}`}</TableCell>
                      <TableCell className="text-center">
                        {qual.eyesight_certified ? 
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : 
                          <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center">
                        {qual.color_blindness_test_passed ? 
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : 
                          <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center">
                        {qual.training_completed ? 
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : 
                          <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center">
                        {qual.practical_demo_passed ? 
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : 
                          <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                      </TableCell>
                      <TableCell>
                        <Badge className={qualified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {qualified ? 'Qualified' : 'Not Qualified'}
                        </Badge>
                        {expiring && qualified && (
                          <Badge className="ml-2 bg-yellow-100 text-yellow-800">Expiring Soon</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {qual.qualification_valid_until ? 
                          new Date(qual.qualification_valid_until).toLocaleDateString() : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(qual)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(qual.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {(!qualifications || qualifications.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No operator qualifications. Click "Add Qualification" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
            <p className="font-medium text-blue-800">Qualification Requirements (APIC Section 11)</p>
            <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
              <li>Eyesight certification (near vision, color vision)</li>
              <li>Training on cleaning procedures and sampling techniques</li>
              <li>Practical demonstration of cleaning verification</li>
              <li>Requalification every 2 years</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Qualification Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Add'} Operator Qualification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operator-select">Operator *</Label>
              <select
                id="operator-select"
                className="w-full p-2 border rounded-md"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) })}
                aria-label="Select Operator"
                title="Select Operator"
              >
                <option value="">Select Operator</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualified-by">Qualified By *</Label>
              <Input
                id="qualified-by"
                placeholder="Name of qualified person"
                value={formData.qualified_by}
                onChange={(e) => setFormData({ ...formData, qualified_by: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.eyesight_certified}
                  onChange={(e) => handleCheckboxChange('eyesight_certified', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                />
                <span className="text-sm">Eyesight Certified (including color vision)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.color_blindness_test_passed}
                  onChange={(e) => handleCheckboxChange('color_blindness_test_passed', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                />
                <span className="text-sm">Color Blindness Test Passed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.training_completed}
                  onChange={(e) => handleCheckboxChange('training_completed', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                />
                <span className="text-sm">Training Completed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.practical_demo_passed}
                  onChange={(e) => handleCheckboxChange('practical_demo_passed', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                />
                <span className="text-sm">Practical Demonstration Passed</span>
              </label>
            </div>

            <Button onClick={handleSubmit} disabled={createQual.isPending || updateQual.isPending} className="w-full">
              {createQual.isPending || updateQual.isPending ? 'Saving...' : (editingId ? 'Update' : 'Create')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}