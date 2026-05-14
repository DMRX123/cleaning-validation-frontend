'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, Printer } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface ReportPreviewProps {
  sessionId: number
  sessionCode: string
  data: {
    previous_product: { name: string; min_batch_size: number; max_batch_size: number }
    next_product: { name: string; min_batch_size: number; max_batch_size: number; solubility: string }
    lowest_maco: number
    swab_limit_ppm: number
    swab_results: Array<{ location_name: string; result_ppm: number; reported: string }>
    rinse_results: Array<{ equipment_name: string; result_ppm: number; reported: string }>
    status: string
    created_at: string
  }
  onDownload?: () => void
}

export function ReportPreview({ sessionId, sessionCode, data, onDownload }: ReportPreviewProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/reports/${sessionId}/pdf`, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `validation_report_${sessionCode}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Report downloaded')
      if (onDownload) onDownload()
    } catch (error) {
      toast.error('Failed to download report')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const allPassed = data.swab_results?.every(r => 
    r.reported !== 'Below LOQ' && r.result_ppm < data.swab_limit_ppm
  ) ?? true

  return (
    <Card className="print:shadow-none">
      <CardHeader className="print:hidden">
        <div className="flex justify-between items-center">
          <CardTitle>Report Preview: {sessionCode}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Downloading...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold text-pharma-700">Cleaning Validation Report</h1>
          <p className="text-gray-500">Session Code: {sessionCode}</p>
          <p className="text-gray-500 text-sm">Generated on: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Status */}
        <div className={`p-4 rounded-lg ${allPassed ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`text-2xl ${allPassed ? 'text-green-600' : 'text-red-600'}`}>
              {allPassed ? '✓' : '✗'}
            </div>
            <div>
              <h3 className={`font-semibold ${allPassed ? 'text-green-800' : 'text-red-800'}`}>
                Validation {allPassed ? 'PASSED' : 'NEEDS REVIEW'}
              </h3>
              <p className={`text-sm ${allPassed ? 'text-green-700' : 'text-red-700'}`}>
                {allPassed 
                  ? 'All results are within acceptable limits.' 
                  : 'Some results exceeded acceptable limits. Investigation required.'}
              </p>
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div>
          <h2 className="text-lg font-semibold mb-3">1. Product Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Previous Product</p>
              <p className="font-medium">{data.previous_product?.name}</p>
              <p className="text-sm">Batch Size: {data.previous_product?.min_batch_size} - {data.previous_product?.max_batch_size} kg</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Next Product</p>
              <p className="font-medium">{data.next_product?.name}</p>
              <p className="text-sm">Batch Size: {data.next_product?.min_batch_size} - {data.next_product?.max_batch_size} kg</p>
              <p className="text-sm">Solubility: {data.next_product?.solubility}</p>
            </div>
          </div>
        </div>

        {/* MACO Results */}
        <div>
          <h2 className="text-lg font-semibold mb-3">2. MACO Calculation Results</h2>
          <div className="p-3 bg-pharma-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">Lowest MACO Selected</p>
            <p className="text-2xl font-bold text-pharma-700">{data.lowest_maco} mg</p>
          </div>
        </div>

        {/* Swab Results */}
        {data.swab_results && data.swab_results.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">3. Swab Results</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">Result (ppm)</th>
                  <th className="p-2 text-left">Limit (ppm)</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.swab_results.map((result, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{result.location_name}</td>
                    <td className="p-2">{result.result_ppm?.toFixed(2) || '-'}</td>
                    <td className="p-2">{data.swab_limit_ppm}</td>
                    <td className="p-2">
                      <Badge variant={result.reported === 'Below LOQ' ? 'outline' : 'default'}>
                        {result.reported}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rinse Results */}
        {data.rinse_results && data.rinse_results.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">4. Rinse Results</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Equipment</th>
                  <th className="p-2 text-left">Result (ppm)</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.rinse_results.map((result, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{result.equipment_name}</td>
                    <td className="p-2">{result.result_ppm?.toFixed(2) || '-'}</td>
                    <td className="p-2">
                      <Badge variant={result.reported === 'Below LOQ' ? 'outline' : 'default'}>
                        {result.reported}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-4 mt-4 text-center text-sm text-gray-500">
          <p>This report is system generated and requires authorized signature.</p>
          <p className="mt-2">_________________________</p>
          <p>Authorized Signatory</p>
        </div>
      </CardContent>
    </Card>
  )
}