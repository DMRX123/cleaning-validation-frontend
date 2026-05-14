'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { SOLUBILITY, CLEANING_DIFFICULTY, PLANTS } from '@/lib/constants'
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-products'
import toast from 'react-hot-toast'

interface ProductFormProps {
  initialData?: any
  isEditing?: boolean
}

export function ProductForm({ initialData, isEditing }: ProductFormProps) {
  const router = useRouter()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    min_batch_size: initialData?.min_batch_size || '',
    max_batch_size: initialData?.max_batch_size || '',
    ade_pde: initialData?.ade_pde || '',
    min_dose: initialData?.min_dose || '',
    max_dose: initialData?.max_dose || '',
    swab_recovery: initialData?.swab_recovery || 100,
    lod: initialData?.lod || 0.1,
    loq: initialData?.loq || 0.5,
    swab_dilution: initialData?.swab_dilution || 20,
    solubility: initialData?.solubility || 'Soluble',
    hardest_to_clean: initialData?.hardest_to_clean || 'Medium',
    plant: initialData?.plant || 'Plant-1',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data = {
      ...formData,
      min_batch_size: parseFloat(formData.min_batch_size as any),
      max_batch_size: parseFloat(formData.max_batch_size as any),
      ade_pde: parseFloat(formData.ade_pde as any),
      min_dose: parseFloat(formData.min_dose as any),
      max_dose: parseFloat(formData.max_dose as any),
      swab_recovery: parseFloat(formData.swab_recovery as any),
      lod: parseFloat(formData.lod as any),
      loq: parseFloat(formData.loq as any),
      swab_dilution: parseFloat(formData.swab_dilution as any),
    }

    try {
      if (isEditing && initialData?.id) {
        await updateProduct.mutateAsync({ id: initialData.id, data })
      } else {
        await createProduct.mutateAsync(data)
      }
      router.push('/products')
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Plant *</Label>
              <Select
                required
                value={formData.plant}
                onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
              >
                {PLANTS.map((plant) => (
                  <option key={plant} value={plant}>{plant}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min Batch Size (kg) *</Label>
              <Input
                type="number"
                step="0.1"
                required
                value={formData.min_batch_size}
                onChange={(e) => setFormData({ ...formData, min_batch_size: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Batch Size (kg) *</Label>
              <Input
                type="number"
                step="0.1"
                required
                value={formData.max_batch_size}
                onChange={(e) => setFormData({ ...formData, max_batch_size: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>ADE/PDE (µg/day) *</Label>
              <Input
                type="number"
                step="0.1"
                required
                value={formData.ade_pde}
                onChange={(e) => setFormData({ ...formData, ade_pde: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Min Dose (mg) *</Label>
              <Input
                type="number"
                step="0.1"
                required
                value={formData.min_dose}
                onChange={(e) => setFormData({ ...formData, min_dose: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Dose (mg) *</Label>
              <Input
                type="number"
                step="0.1"
                required
                value={formData.max_dose}
                onChange={(e) => setFormData({ ...formData, max_dose: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Swab Recovery (%) *</Label>
              <Input
                type="number"
                step="0.1"
                required
                value={formData.swab_recovery}
                onChange={(e) => setFormData({ ...formData, swab_recovery: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>LOD (ppm) *</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.lod}
                onChange={(e) => setFormData({ ...formData, lod: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>LOQ (ppm) *</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.loq}
                onChange={(e) => setFormData({ ...formData, loq: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Swab Dilution (ml) *</Label>
              <Input
                type="number"
                step="0.1"
                required
                value={formData.swab_dilution}
                onChange={(e) => setFormData({ ...formData, swab_dilution: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Solubility *</Label>
              <Select
                required
                value={formData.solubility}
                onChange={(e) => setFormData({ ...formData, solubility: e.target.value })}
              >
                {SOLUBILITY.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cleaning Difficulty *</Label>
              <Select
                required
                value={formData.hardest_to_clean}
                onChange={(e) => setFormData({ ...formData, hardest_to_clean: e.target.value })}
              >
                {CLEANING_DIFFICULTY.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/products')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}