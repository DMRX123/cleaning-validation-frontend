'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

export function Step1_SelectProducts({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [products, setProducts] = useState<any[]>([])
  const [plants, setPlants] = useState<string[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [selectedPlant, setSelectedPlant] = useState<string>('')

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data))
    api.get('/static/plants').then((res) => setPlants(res.data))
  }, [])

  useEffect(() => {
    if (selectedPlant) {
      setFilteredProducts(products.filter(p => p.plant === selectedPlant))
    } else {
      setFilteredProducts(products)
    }
  }, [selectedPlant, products])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Select Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Plant / Block</Label>
            <Select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
            >
              <option value="">All Plants</option>
              {plants.map((plant) => (
                <option key={plant} value={plant}>{plant}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Previous Product <span className="text-red-500">*</span></Label>
            <Select
              value={data.previousProductId || ''}
              onChange={(e) => onChange({ ...data, previousProductId: parseInt(e.target.value) })}
              required
            >
              <option value="">Select Previous Product</option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.plant})</option>
              ))}
            </Select>
            {!data.previousProductId && (
              <p className="text-xs text-red-500">Required field</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Next Product <span className="text-red-500">*</span></Label>
            <Select
              value={data.nextProductId || ''}
              onChange={(e) => onChange({ ...data, nextProductId: parseInt(e.target.value) })}
              required
            >
              <option value="">Select Next Product</option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.plant})</option>
              ))}
            </Select>
            {!data.nextProductId && (
              <p className="text-xs text-red-500">Required field</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Extra Surface Area (%)</Label>
          <Input
            type="number"
            value={data.extraAreaPercentage || 0}
            onChange={(e) => onChange({ ...data, extraAreaPercentage: parseFloat(e.target.value) })}
            placeholder="Enter extra percentage (e.g., 20)"
          />
          <p className="text-xs text-gray-500">Add extra surface area for worst case calculation</p>
        </div>

        {(data.previousProductId && data.nextProductId) && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Products selected. Click Next to continue.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}