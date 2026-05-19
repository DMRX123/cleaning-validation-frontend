// src/components/recovery/RecoveryStudyManager.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, FlaskConical } from 'lucide-react'
import { useRecoveryStudies, useCreateRecoveryStudy } from '@/hooks/useRecoveryStudy'
import { useProducts } from '@/hooks/useProducts'
import toast from 'react-hot-toast'

const MATERIALS_OF_CONSTRUCTION = [
  'Stainless Steel 316L',
  'Stainless Steel 304',
  'Hastelloy C22',
  'Glass Lined',
  'PTFE Lined',
  'Teflon',
  'Polypropylene',
  'EPDM Rubber',
  'Viton',
  'Silicone',
]

interface RecoveryStudyManagerProps {
  productId?: number
}

export function RecoveryStudyManager({ productId }: RecoveryStudyManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(productId || null)
  const [formData, setFormData] = useState({
    material_of_construction: MATERIALS_OF_CONSTRUCTION[0],
    recovery_percent: 85,
    study_date: new Date().toISOString().split('T')[0],
    report_reference: '',
    notes: '',
  })

  const { data: studies, refetch } = useRecoveryStudies(selectedProduct || undefined)
  const { data: products } = useProducts()
  const createStudy = useCreateRecoveryStudy()

  const handleSubmit = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }
    if (!formData.material_of_construction) {
      toast.error('Please select material of construction')
      return
    }
    if (formData.recovery_percent < 50 || formData.recovery_percent > 150) {
      toast.error('Recovery percent should be between 50% and 150%')
      return
    }

    await createStudy.mutateAsync({
      product_id: selectedProduct,
      material_of_construction: formData.material_of_construction,
      recovery_percent: formData.recovery_percent,
      study_date: formData.study_date,
      report_reference: formData.report_reference,
      notes: formData.notes,
    })

    setIsDialogOpen(false)
    setFormData({
      material_of_construction: MATERIALS_OF_CONSTRUCTION[0],
      recovery_percent: 85,
      study_date: new Date().toISOString().split('T')[0],
      report_reference: '',
      notes: '',
    })
    refetch()
  }

  const getAcceptability = (recovery: number) => {
    if (recovery >= 70) return { text: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (recovery >= 50) return { text: 'Acceptable', color: 'bg-yellow-100 text-yellow-800' }
    return { text: 'Unacceptable', color: 'bg-red-100 text-red-800' }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-pharma-600" />
          Recovery Studies (Section 8.3)
        </CardTitle>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Study
        </Button>
      </CardHeader>
      <CardContent>
        {/* Product Filter */}
        {!productId && (
          <div className="mb-4">
            <Label htmlFor="product-filter">Filter by Product</Label>
            <select
              id="product-filter"
              className="w-full mt-1 p-2 border rounded-md"
              value={selectedProduct || ''}
              onChange={(e) => setSelectedProduct(parseInt(e.target.value) || null)}
              aria-label="Filter by Product"
              title="Filter by Product"
            >
              <option value="">All Products</option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Recovery Studies Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Material of Construction</TableHead>
                <TableHead className="text-center">Recovery %</TableHead>
                <TableHead className="text-center">Correction Factor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Study Date</TableHead>
                <TableHead>Report Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studies?.map((study) => {
                const acceptability = getAcceptability(study.recovery_percent)
                return (
                  <TableRow key={study.id}>
                    <TableCell>{study.product_name || `ID: ${study.product_id}`}</TableCell>
                    <TableCell className="font-medium">{study.material_of_construction}</TableCell>
                    <TableCell className="text-center font-bold">{study.recovery_percent}%</TableCell>
                    <TableCell className="text-center">{study.correction_factor.toFixed(3)}</TableCell>
                    <TableCell>
                      <Badge className={acceptability.color}>{acceptability.text}</Badge>
                    </TableCell>
                    <TableCell>{new Date(study.study_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono text-sm">{study.report_reference || '-'}</TableCell>
                  </TableRow>
                )
              })}
              {(!studies || studies.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No recovery studies found. Click "Add Study" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Reference Note */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
          <p className="font-medium">Correction Factor Formula</p>
          <p className="text-xs text-gray-600 mt-1">
            Correction Factor = 100 ÷ Recovery %<br />
            Actual Residue = Measured Residue × Correction Factor
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Recovery studies must be performed for each material of construction (MOC) with at least 50% recovery.
          </p>
        </div>
      </CardContent>

      {/* Add Recovery Study Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Recovery Study</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!productId && (
              <div className="space-y-2">
                <Label htmlFor="dialog-product">Product *</Label>
                <select
                  id="dialog-product"
                  className="w-full p-2 border rounded-md"
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(parseInt(e.target.value))}
                  aria-label="Select Product"
                  title="Select Product"
                >
                  <option value="">Select Product</option>
                  {products?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="material-of-construction">Material of Construction *</Label>
              <select
                id="material-of-construction"
                className="w-full p-2 border rounded-md"
                value={formData.material_of_construction}
                onChange={(e) => setFormData({ ...formData, material_of_construction: e.target.value })}
                aria-label="Material of Construction"
                title="Material of Construction"
              >
                {MATERIALS_OF_CONSTRUCTION.map((moc) => (
                  <option key={moc} value={moc}>{moc}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recovery-percent">Recovery Percent (%) *</Label>
              <Input
                id="recovery-percent"
                type="number"
                step="0.1"
                min={0}
                max={150}
                value={formData.recovery_percent}
                onChange={(e) => setFormData({ ...formData, recovery_percent: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-gray-500">Acceptable range: 50% - 150%</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="study-date">Study Date</Label>
              <Input
                id="study-date"
                type="date"
                value={formData.study_date}
                onChange={(e) => setFormData({ ...formData, study_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-reference">Report Reference</Label>
              <Input
                id="report-reference"
                placeholder="e.g., AN-2024-001"
                value={formData.report_reference}
                onChange={(e) => setFormData({ ...formData, report_reference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} disabled={createStudy.isPending}>
                {createStudy.isPending ? 'Saving...' : 'Save Study'}
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}