'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Droplets, Volume2, AlertCircle } from 'lucide-react'

interface RinseLimitDisplayProps {
  limit: {
    limit_mg: number
    limit_ppm: number
    volume_10ppm: number
    volume_loq: number
  } | null
  equipmentName?: string
  loading?: boolean
}

export function RinseLimitDisplay({ limit, equipmentName, loading }: RinseLimitDisplayProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pharma-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!limit) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            Select equipment to calculate rinse limit
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Rinse Limit Calculation
          {equipmentName && <span className="text-sm font-normal text-gray-500">for {equipmentName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-xl text-center">
            <Droplets className="h-8 w-8 text-pharma-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">Rinse Limit</p>
            <p className="text-3xl font-bold text-pharma-700">{limit.limit_mg.toFixed(4)} mg</p>
            <p className="text-xs text-gray-400 mt-2">(MACO × Eq Area) / Total Area</p>
          </div>
          
          <div className="p-6 bg-pharma-50 rounded-xl text-center">
            <AlertCircle className="h-8 w-8 text-pharma-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">Rinse Limit</p>
            <p className="text-3xl font-bold text-pharma-700">{limit.limit_ppm.toFixed(2)} ppm</p>
            <p className="text-xs text-gray-500 mt-2">ppm = mg/L (based on rinse volume)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Volume (10 ppm based)</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{limit.volume_10ppm.toFixed(2)} L</p>
            <p className="text-xs text-blue-600 mt-1">Minimum rinse volume based on 10 ppm standard</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Volume (LOQ based)</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{limit.volume_loq.toFixed(2)} L</p>
            <p className="text-xs text-green-600 mt-1">Minimum rinse volume to detect at LOQ level</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Actual rinse volume used should be greater than or equal to 
            the LOQ-based volume ({limit.volume_loq.toFixed(2)} L) for reliable quantitation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}