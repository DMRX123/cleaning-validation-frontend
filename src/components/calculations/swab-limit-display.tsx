'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ruler, FlaskConical, AlertTriangle } from 'lucide-react'

interface SwabLimitDisplayProps {
  limit: {
    mg_per_swab: number
    ppm: number
  } | null
  productName?: string
  loading?: boolean
}

export function SwabLimitDisplay({ limit, productName, loading }: SwabLimitDisplayProps) {
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
            Complete previous steps to calculate swab limit
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Swab Limit Calculation
          {productName && <span className="text-sm font-normal text-gray-500">for {productName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-xl text-center">
            <FlaskConical className="h-8 w-8 text-pharma-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">Swab Limit</p>
            <p className="text-3xl font-bold text-pharma-700">{limit.mg_per_swab.toFixed(6)} mg/swab</p>
            <p className="text-xs text-gray-400 mt-2">(MACO × Swab Area) / (Total Area × Recovery)</p>
          </div>
          
          <div className="p-6 bg-pharma-50 rounded-xl text-center">
            <AlertTriangle className="h-8 w-8 text-pharma-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">Swab Limit</p>
            <p className="text-3xl font-bold text-pharma-700">{limit.ppm.toFixed(2)} ppm</p>
            <p className="text-xs text-gray-500 mt-2">
              (MACO × Swab Area × 1000) / (Total Area × Dilution × Recovery)
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Acceptance Criteria:</strong> Swab results must be below {limit.ppm.toFixed(2)} ppm 
            to be considered acceptable. Results below LOQ will be reported as "Below LOQ".
          </p>
        </div>
      </CardContent>
    </Card>
  )
}