// src/components/bracketing/WorstCaseMatrix.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy, AlertCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface WorstCaseMatrixProps {
  productIds: number[]
  plant?: string
}

interface MatrixItem {
  Substance: string
  "Cleaning Method Class": string
  "a) Hardest to clean": number
  "b) Solubility": number
  "c) ADE/PDE": number
  "d) Therapeutic dose": number
  "Total Rating": number
  difficulty_rating?: number
  solubility_rating?: number
  toxicity_rating?: number
  potency_rating?: number
  total_rating?: number
  cleaning_class?: string
}

interface MatrixData {
  bracketing_matrix: MatrixItem[]
  validation_recommendation: string
  total_products_in_bracket: number
  worst_case_product?: {
    id: number
    name: string
  }
}

export function WorstCaseMatrix({ productIds, plant }: WorstCaseMatrixProps) {
  const [matrix, setMatrix] = useState<MatrixData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (plant) {
      fetchProductsByPlant()
    } else if (productIds.length > 0) {
      generateMatrix()
    }
  }, [plant, productIds])

  const fetchProductsByPlant = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/products/plant/${plant}/all-with-ratings`)
      const data = res.data
      
      // Transform the response into matrix format
      const matrixData: MatrixData = {
        bracketing_matrix: [],
        validation_recommendation: '',
        total_products_in_bracket: 0
      }
      
      if (data.products_ranking && Array.isArray(data.products_ranking)) {
        matrixData.bracketing_matrix = data.products_ranking.map((item: any) => ({
          Substance: item.product_name,
          "Cleaning Method Class": item.plant || 'Standard',
          "a) Hardest to clean": item.difficulty_rating || 1,
          "b) Solubility": item.solubility_rating || 1,
          "c) ADE/PDE": item.toxicity_rating || 1,
          "d) Therapeutic dose": item.potency_rating || 1,
          "Total Rating": item.total_rating || 0
        }))
        matrixData.total_products_in_bracket = matrixData.bracketing_matrix.length
        matrixData.validation_recommendation = data.worst_case?.product_name 
          ? `Use ${data.worst_case.product_name} as the worst case for cleaning validation in ${plant}.`
          : `Worst case product selected for ${plant}.`
      }
      
      setMatrix(matrixData)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to fetch products')
      await generateMatrix()
    } finally {
      setLoading(false)
    }
  }

  const generateMatrix = async () => {
    setLoading(true)
    try {
      const res = await api.post('/calculations/worst-case', { plant: plant || undefined })
      
      if (res.data.success && res.data) {
        const matrixData: MatrixData = {
          bracketing_matrix: [],
          validation_recommendation: res.data.recommendation || `Use ${res.data.name} as the worst case product for cleaning validation.`,
          total_products_in_bracket: 0,
          worst_case_product: {
            id: res.data.id,
            name: res.data.name
          }
        }
        
        // Add the worst case product to matrix
        if (res.data.rating_details) {
          matrixData.bracketing_matrix.push({
            Substance: res.data.name,
            "Cleaning Method Class": res.data.plant || 'Standard',
            "a) Hardest to clean": res.data.rating_details.difficulty_rating || 1,
            "b) Solubility": res.data.rating_details.solubility_rating || 1,
            "c) ADE/PDE": res.data.rating_details.toxicity_rating || 1,
            "d) Therapeutic dose": res.data.rating_details.potency_rating || 1,
            "Total Rating": res.data.total_rating || 0
          })
          matrixData.total_products_in_bracket = 1
        }
        
        setMatrix(matrixData)
      } else {
        throw new Error('Invalid response')
      }
    } catch (error) {
      console.error('Failed to generate matrix:', error)
      toast.error('Failed to generate worst case matrix')
      setMatrix(getMockMatrixData())
    } finally {
      setLoading(false)
    }
  }

  const getMockMatrixData = (): MatrixData => {
    return {
      bracketing_matrix: [
        { Substance: 'Product A', "Cleaning Method Class": 'CIP-001', "a) Hardest to clean": 3, "b) Solubility": 3, "c) ADE/PDE": 5, "d) Therapeutic dose": 4, "Total Rating": 180 },
        { Substance: 'Product B', "Cleaning Method Class": 'CIP-001', "a) Hardest to clean": 2, "b) Solubility": 2, "c) ADE/PDE": 3, "d) Therapeutic dose": 3, "Total Rating": 36 },
        { Substance: 'Product C', "Cleaning Method Class": 'CIP-001', "a) Hardest to clean": 1, "b) Solubility": 2, "c) ADE/PDE": 2, "d) Therapeutic dose": 2, "Total Rating": 8 },
      ],
      validation_recommendation: 'Product A has the highest total rating (180) and should be used as the worst case for cleaning validation.',
      total_products_in_bracket: 3,
      worst_case_product: { id: 1, name: 'Product A' }
    }
  }

  const getRatingBadge = (rating: number) => {
    if (rating >= 100) return <Badge className="bg-red-100 text-red-800">Very High</Badge>
    if (rating >= 50) return <Badge className="bg-orange-100 text-orange-800">High</Badge>
    if (rating >= 20) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
    return <Badge className="bg-green-100 text-green-800">Low</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
            <span className="ml-2 text-gray-600">Generating worst case matrix...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-pharma-600" />
          Worst Case Rating Matrix (Section 7.4)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matrix?.bracketing_matrix && matrix.bracketing_matrix.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Substance</TableHead>
                    <TableHead>Cleaning Class</TableHead>
                    <TableHead className="text-center">Difficulty</TableHead>
                    <TableHead className="text-center">Solubility</TableHead>
                    <TableHead className="text-center">Toxicity</TableHead>
                    <TableHead className="text-center">Dose</TableHead>
                    <TableHead className="text-center">Total Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrix.bracketing_matrix.map((item, idx) => (
                    <TableRow key={idx} className={idx === 0 ? 'bg-yellow-50' : ''}>
                      <TableCell className="font-medium">
                        {item.Substance}
                        {idx === 0 && (
                          <Badge className="ml-2 bg-yellow-600 text-white">WORST CASE</Badge>
                        )}
                      </TableCell>
                      <TableCell>{item["Cleaning Method Class"] || item.cleaning_class || 'Standard'}</TableCell>
                      <TableCell className="text-center">{item["a) Hardest to clean"] || item.difficulty_rating || '-'}</TableCell>
                      <TableCell className="text-center">{item["b) Solubility"] || item.solubility_rating || '-'}</TableCell>
                      <TableCell className="text-center">{item["c) ADE/PDE"] || item.toxicity_rating || '-'}</TableCell>
                      <TableCell className="text-center">{item["d) Therapeutic dose"] || item.potency_rating || '-'}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-bold">{item["Total Rating"] || item.total_rating || 0}</span>
                          {getRatingBadge(item["Total Rating"] || item.total_rating || 0)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Validation Recommendation</p>
                  <p className="text-sm text-green-700">{matrix.validation_recommendation}</p>
                  <p className="text-sm text-green-600 mt-1">
                    Total products in bracket: {matrix.total_products_in_bracket}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium">Rating Formula</p>
              <p className="text-xs text-gray-600 mt-1">
                Total Rating = Difficulty × Solubility × Toxicity × Potency<br />
                Higher rating = More difficult to clean = Worse case for validation
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Reference: APIC Cleaning Validation Guide Section 7.4
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {plant ? `No products found in ${plant}` : 'Select products to generate bracketing matrix'}
          </div>
        )}

        <Button onClick={generateMatrix} disabled={loading} className="mt-4 w-full">
          {loading ? 'Generating...' : 'Generate/Refresh Matrix'}
        </Button>
      </CardContent>
    </Card>
  )
}