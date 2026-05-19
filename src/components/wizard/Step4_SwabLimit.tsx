// src/components/wizard/Step4_SwabLimit.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, Ruler, FlaskConical } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step4_SwabLimit({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [swabData, setSwabData] = useState<any>(null)

  const calculateSwabLimit = async () => {
    if (!data.sessionId) {
      toast.error('Please create session first')
      return
    }

    if (!data.totalSurfaceArea || data.totalSurfaceArea <= 0) {
      toast.error('Please select equipment in Step 2 first')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/calculations/swab-limit', {
        session_id: data.sessionId,
        total_surface_area: data.totalSurfaceArea
      })

      const swabLimit = {
        mg_per_swab: response.data.mg_per_swab,
        ppm: response.data.ppm,
        formula: response.data.formula,
        reference: response.data.reference,
      }

      setSwabData(swabLimit)
      onChange({ ...data, swabLimit })
      toast.success('Swab limit calculated successfully')
    } catch (error: any) {
      console.error('Swab limit calculation failed:', error)
      toast.error(error.response?.data?.detail || 'Failed to calculate swab limit')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (data.sessionId && data.totalSurfaceArea && data.totalSurfaceArea > 0 && !data.swabLimit && !loading) {
      calculateSwabLimit()
    }
  }, [data.sessionId, data.totalSurfaceArea])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Step 4: Swab Limit Calculation (APIC Section 4.2.4)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {swabData ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-green-50 rounded-xl text-center border border-green-200">
                <FlaskConical className="h-8 w-8 text-pharma-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Swab Limit (per swab)</p>
                <p className="text-3xl font-bold text-pharma-700">{swabData.mg_per_swab?.toFixed(6)} mg/swab</p>
                <p className="text-xs text-gray-500 mt-2">(MACO × Swab Area) / (Total Area × Recovery)</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-xl text-center border border-blue-200">
                <AlertCircle className="h-8 w-8 text-pharma-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Swab Limit</p>
                <p className="text-3xl font-bold text-pharma-700">{swabData.ppm?.toFixed(2)} ppm</p>
                <p className="text-xs text-gray-500 mt-2">(MACO × Swab Area × 1000) / (Total Area × Dilution × Recovery)</p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">Acceptance Criteria</p>
              <p className="text-sm text-yellow-700 mt-1">
                Swab results must be below <strong>{swabData.ppm?.toFixed(2)} ppm</strong> to be acceptable.
                Results below LOQ will be reported as "Below LOQ".
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium">Formula Reference</p>
              <p className="text-xs text-gray-600 mt-1">{swabData.formula}</p>
              <p className="text-xs text-gray-500 mt-1">{swabData.reference}</p>
            </div>

            <Button onClick={calculateSwabLimit} disabled={loading} variant="outline" className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Recalculate Swab Limit
            </Button>
          </>
        ) : (
          <div className="text-center py-8">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-pharma-600" />
                <span>Calculating swab limit...</span>
              </div>
            ) : (
              <>
                <p className="text-gray-500 mb-4">Swab limit not calculated yet</p>
                <Button onClick={calculateSwabLimit} disabled={loading}>
                  Calculate Swab Limit
                </Button>
              </>
            )}
          </div>
        )}

        {(!data.totalSurfaceArea || data.totalSurfaceArea <= 0) && (
          <div className="p-3 bg-red-50 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">
              No equipment selected. Please go back to Step 2 and select at least one equipment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}