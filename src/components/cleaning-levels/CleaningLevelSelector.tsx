'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface CleaningLevelSelectorProps {
  previousProductId: number
  nextProductId: number 
  onLevelDetermined: (level: string, requirements: any) => void
}

export function CleaningLevelSelector({ 
  previousProductId, 
  nextProductId, 
  onLevelDetermined 
}: CleaningLevelSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [level, setLevel] = useState<string | null>(null)
  const [requirements, setRequirements] = useState<any>(null)
  const [sameChain, setSameChain] = useState(false)

  useEffect(() => {
    if (previousProductId && nextProductId) {
      determineLevel()
    }
  }, [previousProductId, nextProductId, sameChain])

  const determineLevel = async () => {
    setLoading(true)
    try {
      const res = await api.post('/cleaning-validation/determine-cleaning-level', {
        previous_product_id: previousProductId,
        next_product_id: nextProductId,
        same_synthetic_chain: sameChain
      })
      
      const responseData = res.data.data || res.data
      setLevel(responseData.cleaning_level)
      setRequirements(responseData.requirements)
      onLevelDetermined(responseData.cleaning_level, responseData.requirements)
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