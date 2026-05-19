// src/components/cleaning-levels/CleaningLevelSelector.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, Loader2 } from 'lucide-react'

interface CleaningLevelSelectorProps {
  previousProductId: number
  nextProductId: number 
  onLevelDetermined: (level: string, requirements: any) => void
}

// Client-side cleaning level determination based on APIC Section 5.0
const determineCleaningLevel = (
  previousProduct: any, 
  nextProduct: any, 
  sameSyntheticChain: boolean
): { level: string; requirements: any; justification: string } => {
  // Level 0: Same synthetic chain, immediate next step
  if (sameSyntheticChain) {
    return {
      level: 'LEVEL_0',
      requirements: {
        visual_inspection: true,
        analytical_testing: false,
        microbiological_testing: false,
        validation_required: false,
        verification_frequency: null,
        max_residue_ppm: null,
        description: 'Visual inspection only - low risk. Same synthetic chain, carryover covered by impurity profile.'
      },
      justification: `Same synthetic chain selected. Carryover of ${previousProduct?.name} is covered by the impurity profile of ${nextProduct?.name}.`
    }
  }
  
  // Check toxicity - high toxicity requires Level 2
  const isHighToxicity = previousProduct?.ade_pde < 10
  const isDifferentPlant = previousProduct?.plant !== nextProduct?.plant
  
  // Level 2: High risk scenarios
  if (isHighToxicity || isDifferentPlant) {
    return {
      level: 'LEVEL_2',
      requirements: {
        visual_inspection: true,
        analytical_testing: true,
        microbiological_testing: true,
        validation_required: true,
        verification_frequency: 'Every batch',
        max_residue_ppm: 10,
        description: 'Full validation with analytical and microbiological testing - high risk.'
      },
      justification: `High risk: ${isHighToxicity ? `ADE/PDE (${previousProduct?.ade_pde} µg/day) is below threshold` : ''}${isHighToxicity && isDifferentPlant ? ' and ' : ''}${isDifferentPlant ? `different plant (${previousProduct?.plant} → ${nextProduct?.plant})` : ''}. Full validation required.`
    }
  }
  
  // Default Level 1
  return {
    level: 'LEVEL_1',
    requirements: {
      visual_inspection: true,
      analytical_testing: true,
      microbiological_testing: false,
      validation_required: true,
      verification_frequency: 'Periodic (quarterly)',
      max_residue_ppm: 100,
      description: 'Visual + analytical testing - medium risk.'
    },
    justification: `Medium risk: Different product lines but moderate toxicity (ADE/PDE: ${previousProduct?.ade_pde} µg/day). Level 1 validation required.`
  }
}

export function CleaningLevelSelector({ 
  previousProductId, 
  nextProductId, 
  onLevelDetermined 
}: CleaningLevelSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [level, setLevel] = useState<string | null>(null)
  const [requirements, setRequirements] = useState<any>(null)
  const [justification, setJustification] = useState<string>('')
  const [sameChain, setSameChain] = useState(false)
  const [products, setProducts] = useState<any[]>([])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    if (previousProductId && nextProductId && products.length > 0) {
      determineLevel()
    }
  }, [previousProductId, nextProductId, sameChain, products])

  const determineLevel = async () => {
    setLoading(true)
    try {
      const previousProduct = products.find(p => p.id === previousProductId)
      const nextProduct = products.find(p => p.id === nextProductId)
      
      if (!previousProduct || !nextProduct) {
        throw new Error('Products not found')
      }
      
      const result = determineCleaningLevel(previousProduct, nextProduct, sameChain)
      
      setLevel(result.level)
      setRequirements(result.requirements)
      setJustification(result.justification)
      onLevelDetermined(result.level, result.requirements)
    } catch (error) {
      console.error('Failed to determine cleaning level:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelBadge = () => {
    switch(level) {
      case 'LEVEL_0':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Level 0 - Low Risk</Badge>
      case 'LEVEL_1':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Level 1 - Medium Risk</Badge>
      case 'LEVEL_2':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Level 2 - High Risk</Badge>
      default:
        return <Badge variant="outline">Not Determined</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-pharma-600" />
          Cleaning Level Determination (Section 5.0)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sameChain}
              onChange={(e) => setSameChain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
              aria-label="Same synthetic chain"
              title="Same synthetic chain"
            />
            <span className="text-sm font-medium text-gray-700">Same synthetic chain</span>
          </label>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-pharma-600" />
            <span className="ml-2 text-gray-600">Determining cleaning level...</span>
          </div>
        )}

        {!loading && level && requirements && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Determined Cleaning Level:</span>
              {getLevelBadge()}
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-3">Requirements:</p>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Visual Inspection: {requirements.visual_inspection ? 'Required' : 'Not Required'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Analytical Testing: {requirements.analytical_testing ? 'Required' : 'Not Required'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Microbiological Testing: {requirements.microbiological_testing ? 'Required' : 'Not Required'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Validation Required: {requirements.validation_required ? 'Yes' : 'No'}
                </li>
                {requirements.max_residue_ppm && (
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Max Residue Limit: {requirements.max_residue_ppm} ppm
                  </li>
                )}
                {requirements.verification_frequency && (
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Verification Frequency: {requirements.verification_frequency}
                  </li>
                )}
              </ul>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">{requirements.description}</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700"><strong>Justification:</strong> {justification}</p>
            </div>

            <div className="p-2 bg-gray-100 rounded text-xs text-gray-500 text-center">
              Reference: APIC Cleaning Validation Guide Section 5.0
            </div>
          </div>
        )}

        {!loading && !level && (!previousProductId || !nextProductId) && (
          <div className="text-center py-8 text-gray-500">
            Select previous and next products to determine cleaning level
          </div>
        )}
      </CardContent>
    </Card>
  )
}