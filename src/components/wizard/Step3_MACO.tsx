// src/components/wizard/Step3_MACO.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, RefreshCw, TrendingDown } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step3_MACO({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [macoData, setMacoData] = useState<any>(null)

  const calculateMACO = async () => {
    if (!data.previousProductId || !data.nextProductId) {
      toast.error('Please select both products in Step 1 first')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const res = await api.post('/calculations/maco', {
        previous_product_id: data.previousProductId,
        next_product_id: data.nextProductId,
      })

      const macoResult = {
        method_10ppm: res.data.method_10ppm || 0,
        method_100ppm: res.data.method_100ppm || 0,
        method_tdd: res.data.method_tdd || 0,
        method_ade_pde: res.data.method_ade_pde || 0,
        method_ld50: res.data.method_ld50 || 0,
        method_ttc: res.data.method_ttc || 0,
        lowest_maco: res.data.lowest_maco || 0,
        selected_method: res.data.selected_method || 'N/A',
        safety_factor_used: res.data.safety_factor_used || 1000,
        safety_factor_dosage_form: res.data.safety_factor_dosage_form || 'Oral',
      }

      setMacoData(macoResult)
      onChange({ ...data, maco: macoResult })
      toast.success('MACO calculated successfully')
    } catch (err: any) {
      console.error('MACO calculation failed:', err)
      setError(err.response?.data?.detail || 'Failed to calculate MACO')
      toast.error(err.response?.data?.detail || 'Failed to calculate MACO')
    } finally {
      setLoading(false)
    }
  }

  // Auto-calculate when products change
  useEffect(() => {
    if (data.previousProductId && data.nextProductId && !data.maco && !loading) {
      calculateMACO()
    }
  }, [data.previousProductId, data.nextProductId])

  const hasValidMaco = macoData && macoData.lowest_maco > 0

  const isLowest = (value: number) => macoData && value === macoData.lowest_maco

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Step 3: MACO Calculation (APIC Section 4.2.1 - 4.2.3)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
            <p className="text-gray-500">Calculating MACO values...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-red-50 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Calculation Failed</p>
              <p className="text-sm text-red-700">{error}</p>
              <Button variant="outline" size="sm" onClick={calculateMACO} className="mt-2">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && hasValidMaco && (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-semibold">Method</TableHead>
                  <TableHead className="font-semibold text-right">Value (mg)</TableHead>
                  <TableHead className="font-semibold">Formula Reference</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className={isLowest(macoData.method_10ppm) ? 'bg-green-50' : ''}>
                  <TableCell className="font-medium">10 ppm Method</TableCell>
                  <TableCell className="text-right font-mono">{macoData.method_10ppm?.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-gray-500">Section 4.2.2 - General Limit</TableCell>
                  <TableCell>{isLowest(macoData.method_10ppm) && <Badge variant="success">Selected</Badge>}</TableCell>
                </TableRow>
                <TableRow className={isLowest(macoData.method_100ppm) ? 'bg-green-50' : ''}>
                  <TableCell className="font-medium">100 ppm Method</TableCell>
                  <TableCell className="text-right font-mono">{macoData.method_100ppm?.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-gray-500">Alternative General Limit</TableCell>
                  <TableCell>{isLowest(macoData.method_100ppm) && <Badge variant="success">Selected</Badge>}</TableCell>
                </TableRow>
                <TableRow className={isLowest(macoData.method_tdd) ? 'bg-green-50' : ''}>
                  <TableCell className="font-medium">TDD Method</TableCell>
                  <TableCell className="text-right font-mono">{macoData.method_tdd?.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-gray-500">Section 4.2.3 - 1/1000th Dose</TableCell>
                  <TableCell>{isLowest(macoData.method_tdd) && <Badge variant="success">Selected</Badge>}</TableCell>
                </TableRow>
                <TableRow className={isLowest(macoData.method_ade_pde) ? 'bg-green-50' : ''}>
                  <TableCell className="font-medium">ADE/PDE Method</TableCell>
                  <TableCell className="text-right font-mono">{macoData.method_ade_pde?.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-gray-500">Section 4.2.1 - Health-Based</TableCell>
                  <TableCell>{isLowest(macoData.method_ade_pde) && <Badge variant="success">Selected</Badge>}</TableCell>
                </TableRow>
                <TableRow className="bg-pharma-100">
                  <TableCell className="font-bold text-pharma-800">✓ Selected MACO</TableCell>
                  <TableCell className="text-right font-bold text-pharma-800 text-xl">
                    {macoData.lowest_maco?.toFixed(2)} mg
                  </TableCell>
                  <TableCell colSpan={2} className="text-xs text-pharma-700">
                    MIN of all methods - Selected Method: {macoData.selected_method}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Safety Factor:</strong> {macoData.safety_factor_used} 
                (based on {macoData.safety_factor_dosage_form} dosage form)
              </p>
              <p className="text-xs text-blue-600 mt-1">
                The lowest MACO value ({macoData.lowest_maco?.toFixed(2)} mg) will be used for swab and rinse limits.
              </p>
            </div>

            <Button onClick={calculateMACO} disabled={loading} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalculate MACO
            </Button>
          </>
        )}

        {!loading && !error && !hasValidMaco && (
          <div className="text-center py-8">
            {!data.previousProductId || !data.nextProductId ? (
              <>
                <p className="text-gray-500 mb-2">⚠️ Products not selected</p>
                <p className="text-sm text-gray-400">
                  Please go back to Step 1 and select both Previous and Next products
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-2">Click below to calculate MACO</p>
                <Button onClick={calculateMACO} disabled={loading}>
                  Calculate MACO
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}