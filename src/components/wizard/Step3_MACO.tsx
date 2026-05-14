'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step3_MACO({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      // Handle response properly - backend returns data directly
      const macoData = {
        method_10ppm: res.data.method_10ppm || 0,
        method_tdd: res.data.method_tdd || 0,
        method_ade_pde: res.data.method_ade_pde || 0,
        method_ttc: res.data.method_ttc || 0,
        lowest_maco: res.data.lowest_maco || 0
      }

      onChange({ ...data, maco: macoData })
      toast.success('MACO calculated successfully')
    } catch (err: any) {
      console.error('MACO calculation failed:', err)
      setError(err.response?.data?.detail || 'Failed to calculate MACO')
      toast.error(err.response?.data?.detail || 'Failed to calculate MACO')
    } finally {
      setLoading(false)
    }
  }

  // Auto-calculate when products are selected and MACO not yet calculated
  useEffect(() => {
    if (data.previousProductId && data.nextProductId && !data.maco && !loading) {
      calculateMACO()
    }
  }, [data.previousProductId, data.nextProductId])

  // Check if we have valid MACO data
  const hasValidMaco = data.maco && typeof data.maco.lowest_maco === 'number' && data.maco.lowest_maco > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: MACO Calculation (APIC Section 4.2.1 - 4.2.3)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
            <p className="text-gray-500">Calculating MACO values...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-red-50 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Calculation Failed</p>
              <p className="text-sm text-red-700">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={calculateMACO} 
                className="mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Results State */}
        {!loading && !error && hasValidMaco && (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-semibold">Method</TableHead>
                  <TableHead className="font-semibold text-right">Value (mg)</TableHead>
                  <TableHead className="font-semibold">Formula Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">10 ppm Method</TableCell>
                  <TableCell className="text-right font-mono">
                    {data.maco.method_10ppm?.toFixed(2) ?? '0.00'}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">Section 4.2.2 - General Limit</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TDD Method</TableCell>
                  <TableCell className="text-right font-mono">
                    {data.maco.method_tdd?.toFixed(2) ?? '0.00'}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">Section 4.2.3 - 1/1000th Therapeutic Dose</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">ADE/PDE Method</TableCell>
                  <TableCell className="text-right font-mono">
                    {data.maco.method_ade_pde?.toFixed(2) ?? '0.00'}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">Section 4.2.1 - Health-Based Limits</TableCell>
                </TableRow>
                {data.maco.method_ttc > 0 && (
                  <TableRow>
                    <TableCell className="font-medium">TTC Method</TableCell>
                    <TableCell className="text-right font-mono">
                      {data.maco.method_ttc?.toFixed(2) ?? '0.00'}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">Section 4.2.1.3 - Threshold of Toxicological Concern</TableCell>
                  </TableRow>
                )}
                <TableRow className="bg-pharma-100">
                  <TableCell className="font-bold text-pharma-800">✓ Lowest MACO (Selected)</TableCell>
                  <TableCell className="text-right font-bold text-pharma-800 text-lg">
                    {data.maco.lowest_maco?.toFixed(2) ?? '0.00'} mg
                  </TableCell>
                  <TableCell className="text-xs text-pharma-700">
                    MIN of all methods - Used for swab & rinse limits
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The lowest MACO value ({data.maco.lowest_maco?.toFixed(2)} mg) will be used for all subsequent 
                swab and rinse limit calculations.
              </p>
            </div>

            <Button 
              onClick={calculateMACO} 
              disabled={loading} 
              variant="outline" 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalculate MACO
            </Button>
          </>
        )}

        {/* No Data State */}
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

        {/* Debug Info - Remove in production if needed */}
        {process.env.NODE_ENV === 'development' && data.maco && (
          <details className="text-xs text-gray-400 mt-2">
            <summary>Debug Info</summary>
            <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto">
              {JSON.stringify(data.maco, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}