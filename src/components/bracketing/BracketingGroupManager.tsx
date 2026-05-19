// src/components/bracketing/BracketingGroupManager.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trophy, Plus, Trash2, Eye, TrendingUp } from 'lucide-react'
import { useBracketingGroups, useCreateBracketingGroup, useCalculateBracketingMatrix } from '@/hooks/useBracketing'
import { useProducts } from '@/hooks/useProducts'
import toast from 'react-hot-toast'

export function BracketingGroupManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showMatrix, setShowMatrix] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [matrixResult, setMatrixResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    equipment_type: '',
    cleaning_procedure_class: '',
    description: '',
  })

  const { data: groups, refetch } = useBracketingGroups()
  const { data: products } = useProducts()
  const createGroup = useCreateBracketingGroup()
  const calculateMatrix = useCalculateBracketingMatrix()

  const handleSubmit = async () => {
    if (!formData.name || !formData.equipment_type || !formData.cleaning_procedure_class) {
      toast.error('Please fill all required fields')
      return
    }

    await createGroup.mutateAsync(formData)
    setIsDialogOpen(false)
    setFormData({ name: '', equipment_type: '', cleaning_procedure_class: '', description: '' })
    refetch()
  }

  const handleCalculateMatrix = async (groupId: number) => {
    const group = groups?.find(g => g.id === groupId)
    if (!group || !products) return

    const productIds = products.slice(0, 5).map(p => p.id)
    
    const result = await calculateMatrix.mutateAsync({
      equipmentType: group.equipment_type,
      productIds,
    })
    setMatrixResult(result)
    setSelectedGroup(group)
    setShowMatrix(true)
  }

  const getRatingClass = (rating: number) => {
    if (rating >= 24) return 'bg-red-100 text-red-800'
    if (rating >= 16) return 'bg-orange-100 text-orange-800'
    if (rating >= 10) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-pharma-600" />
            Bracketing Groups (Section 7.0)
          </CardTitle>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Equipment Type</TableHead>
                  <TableHead>Cleaning Class</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups?.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.equipment_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{group.cleaning_procedure_class}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{group.description || '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleCalculateMatrix(group.id)}>
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!groups || groups.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No bracketing groups. Click "Create Group" to start.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium">Bracketing Rationale</p>
            <p className="text-xs text-gray-600 mt-1">
              Products are grouped based on similar cleaning difficulty, solubility, toxicity, and dose.
              Worst case product selection: Higher total rating = more difficult to clean.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Group Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Bracketing Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name *</Label>
              <Input
                id="group-name"
                placeholder="e.g., API Reactors Group A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment-type">Equipment Type *</Label>
              <Input
                id="equipment-type"
                placeholder="e.g., Reactor, Centrifuge, Dryer"
                value={formData.equipment_type}
                onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cleaning-class">Cleaning Procedure Class *</Label>
              <select
                id="cleaning-class"
                className="w-full p-2 border rounded-md"
                value={formData.cleaning_procedure_class}
                onChange={(e) => setFormData({ ...formData, cleaning_procedure_class: e.target.value })}
                aria-label="Cleaning Procedure Class"
                title="Cleaning Procedure Class"
              >
                <option value="">Select Class</option>
                <option value="CIP-001">CIP-001 (Standard)</option>
                <option value="CIP-002">CIP-002 (Enhanced)</option>
                <option value="Manual-001">Manual-001</option>
                <option value="Manual-002">Manual-002 (Extended)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">Description</Label>
              <Input
                id="group-description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <Button onClick={handleSubmit} disabled={createGroup.isPending}>
              {createGroup.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Matrix Results Dialog */}
      <Dialog open={showMatrix} onOpenChange={setShowMatrix}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Worst Case Matrix - {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          {matrixResult && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Substance</TableHead>
                    <TableHead className="text-center">Difficulty</TableHead>
                    <TableHead className="text-center">Solubility</TableHead>
                    <TableHead className="text-center">Toxicity</TableHead>
                    <TableHead className="text-center">Dose</TableHead>
                    <TableHead className="text-center">Total Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrixResult.bracketing_matrix?.map((item: any, idx: number) => (
                    <TableRow key={idx} className={idx === 0 ? 'bg-yellow-50' : ''}>
                      <TableCell className="font-medium">
                        {item.Substance}
                        {idx === 0 && <Badge className="ml-2 bg-yellow-600">WORST CASE</Badge>}
                      </TableCell>
                      <TableCell className="text-center">{item["a) Hardest to clean"]}</TableCell>
                      <TableCell className="text-center">{item["b) Solubility"]}</TableCell>
                      <TableCell className="text-center">{item["c) ADE/PDE"]}</TableCell>
                      <TableCell className="text-center">{item["d) Therapeutic dose"]}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getRatingClass(item["Total Rating"])}>
                          {item["Total Rating"]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">Recommendation</p>
                <p className="text-sm text-green-700 mt-1">{matrixResult.recommendation}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}