'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step4_SwabLimit({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [calculated, setCalculated] = useState(false)

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
        ppm: response.data.ppm
      }

      onChange({ ...data, swabLimit })
      setCalculated(true)
      toast.success('Swab limit calculated successfully')
    } catch (error: any) {
      console.error('Swab limit calculation failed:', error)
      toast.error(error.response?.data?.detail || 'Failed to calculate swab limit')
    } finally {
      setLoading(false)
    }
  }

  // Auto-calculate when sessionId and totalSurfaceArea are available
  useEffect(() => {
    if (data.sessionId && data.totalSurfaceArea && data.totalSurfaceArea > 0 && !data.swabLimit && !calculated) {
      calculateSwabLimit()
    }
  }, [data.sessionId, data.totalSurfaceArea])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Swab Limit Calculation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.swabLimit ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-green-50 rounded-xl text-center border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Swab Limit (per swab)</p>
                <p className="text-3xl font-bold text-pharma-700">{data.swabLimit.mg_per_swab?.toFixed(6) || '0'} mg/swab</p>
                <p className="text-xs text-gray-500 mt-2">(MACO × Swab Area) / (Total Area × Recovery)</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-xl text-center border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Swab Limit</p>
                <p className="text-3xl font-bold text-pharma-700">{data.swabLimit.ppm?.toFixed(2) || '0'} ppm</p>
                <p className="text-xs text-gray-500 mt-2">(MACO × Swab Area × 1000) / (Total Area × Dilution × Recovery)</p>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Acceptance Criteria:</strong> Swab results must be below {data.swabLimit.ppm?.toFixed(2)} ppm
              </p>
            </div>

            <Button 
              onClick={calculateSwabLimit} 
              disabled={loading} 
              variant="outline" 
              className="w-full"
            >
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