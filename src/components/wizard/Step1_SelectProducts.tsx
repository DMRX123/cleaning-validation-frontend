// src/components/wizard/Step1_SelectProducts.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  product_code: string
  plant: string
  solubility: string
  hardest_to_clean: string
  ade_pde: number
  min_dose: number
  max_dose: number  // ADD THIS MISSING PROPERTY
}

export function Step1_SelectProducts({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [plants, setPlants] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [worstCaseProduct, setWorstCaseProduct] = useState<Product | null>(null)
  const [selectedPlant, setSelectedPlant] = useState<string>(data.plant || '')

  // Fetch products and plants
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [productsRes, plantsRes] = await Promise.all([
          api.get('/products'),
          api.get('/static/plants')
        ])
        setProducts(productsRes.data)
        setPlants(plantsRes.data?.data || plantsRes.data || ['Plant-1', 'Plant-2', 'Plant-3', 'Plant-4'])
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch worst case product when plant changes
  useEffect(() => {
    if (selectedPlant) {
      const fetchWorstCase = async () => {
        try {
          const res = await api.get(`/products/plant/${selectedPlant}/worst-case`)
          if (res.data.worst_case_product) {
            setWorstCaseProduct(res.data.worst_case_product)
            // Auto-select worst case as previous product
            if (!data.previousProductId) {
              onChange({ ...data, previousProductId: res.data.worst_case_product.id, plant: selectedPlant })
            }
          }
        } catch (error) {
          console.error('Failed to fetch worst case:', error)
        }
      }
      fetchWorstCase()
    }
  }, [selectedPlant])

  // Filter products by plant
  const filteredProducts = selectedPlant 
    ? products.filter(p => p.plant === selectedPlant)
    : products

  // Handle plant change
  const handlePlantChange = (plant: string) => {
    setSelectedPlant(plant)
    onChange({ ...data, plant, previousProductId: null, nextProductId: null })
  }

  // Handle previous product change - auto filter next products from same plant
  const handlePreviousProductChange = (productId: number) => {
    const selectedProduct = products.find(p => p.id === productId)
    if (selectedProduct && selectedProduct.plant !== selectedPlant) {
      setSelectedPlant(selectedProduct.plant)
    }
    onChange({ ...data, previousProductId: productId, nextProductId: null })
  }

  // Auto-select next product (first available from same plant)
  useEffect(() => {
    if (data.previousProductId && !data.nextProductId && filteredProducts.length > 0) {
      // Don't auto-select the same product
      const nextAvailable = filteredProducts.find(p => p.id !== data.previousProductId)
      if (nextAvailable) {
        onChange({ ...data, nextProductId: nextAvailable.id })
      }
    }
  }, [data.previousProductId, filteredProducts])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Select Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plant Selection */}
        <div className="space-y-2">
          <Label htmlFor="plant-select">Plant / Block</Label>
          <select
            id="plant-select"
            className="w-full p-2 border rounded-md"
            value={selectedPlant}
            onChange={(e) => handlePlantChange(e.target.value)}
            aria-label="Select Plant"
            title="Select Plant"
          >
            <option value="">Select Plant</option>
            {plants.map((plant) => (
              <option key={plant} value={plant}>{plant}</option>
            ))}
          </select>
        </div>

        {/* Worst Case Product Display */}
        {worstCaseProduct && (
          <div className="p-3 bg-yellow-50 rounded-lg flex items-start gap-3">
            <Trophy className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Worst Case Product (Auto-Selected)</p>
              <p className="text-sm text-yellow-700">
                <strong>{worstCaseProduct.name}</strong> - 
                Solubility: {worstCaseProduct.solubility} | 
                Difficulty: {worstCaseProduct.hardest_to_clean} | 
                ADE: {worstCaseProduct.ade_pde} µg/day
              </p>
            </div>
          </div>
        )}

        {/* Previous Product Selection */}
        <div className="space-y-2">
          <Label htmlFor="previous-product">Previous Product <span className="text-red-500">*</span></Label>
          <select
            id="previous-product"
            className="w-full p-2 border rounded-md"
            value={data.previousProductId || ''}
            onChange={(e) => handlePreviousProductChange(parseInt(e.target.value))}
            required
            aria-label="Select Previous Product"
            title="Select Previous Product"
          >
            <option value="">Select Previous Product</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (ADE: {p.ade_pde} µg/day)
              </option>
            ))}
          </select>
          {data.previousProductId && (
            <p className="text-xs text-green-600">✓ Product selected</p>
          )}
        </div>

        {/* Next Product Selection - Auto-filtered */}
        <div className="space-y-2">
          <Label htmlFor="next-product">Next Product <span className="text-red-500">*</span></Label>
          <select
            id="next-product"
            className="w-full p-2 border rounded-md"
            value={data.nextProductId || ''}
            onChange={(e) => onChange({ ...data, nextProductId: parseInt(e.target.value) })}
            required
            aria-label="Select Next Product"
            title="Select Next Product"
          >
            <option value="">Select Next Product</option>
            {filteredProducts
              .filter(p => p.id !== data.previousProductId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Dose: {p.min_dose} - {p.max_dose} mg)
                </option>
              ))}
          </select>
        </div>

        {/* Extra Surface Area */}
        <div className="space-y-2">
          <Label htmlFor="extra-area">Extra Surface Area (%)</Label>
          <Input
            id="extra-area"
            type="number"
            step="5"
            min={0}
            max={50}
            value={data.extraAreaPercentage || 0}
            onChange={(e) => onChange({ ...data, extraAreaPercentage: parseFloat(e.target.value) || 0 })}
            placeholder="Enter extra percentage (e.g., 20)"
          />
          <p className="text-xs text-gray-500">
            Add extra surface area for worst case calculation (APIC Section 4.2.4)
          </p>
        </div>

        {/* Product Count Display */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <Badge variant="outline">{filteredProducts.length} products in {selectedPlant || 'selected plant'}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}