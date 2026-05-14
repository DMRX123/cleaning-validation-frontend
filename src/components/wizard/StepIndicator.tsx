'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, Eye, Download, FileText } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step9_ReviewReport({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Check if all required data is present
  const hasMaco = data.maco && data.maco.lowest_maco > 0
  const hasSwabLimit = data.swabLimit && data.swabLimit.ppm > 0
  const hasRinseLimit = data.rinseLimit && data.rinseLimit.limit_ppm > 0
  const hasSwabResults = data.swabResults && data.swabResults.length > 0
  const hasRinseResults = data.rinseResults && data.rinseResults.length > 0
  const hasStandardPrep = data.standardPrep && data.standardPrep.dilution_factor > 0

  const isComplete = hasMaco && hasSwabLimit && hasRinseLimit && hasSwabResults && hasRinseResults && hasStandardPrep

  const handleGenerateReport = async () => {
    if (!data.sessionId) {
      toast.error('No session found. Please complete previous steps.')
      return
    }

    if (!isComplete) {
      toast.error('Please complete all previous steps before generating report')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/reports/${data.sessionId}/pdf`, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `validation_report_${data.sessionCode || data.sessionId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Report generated and downloaded successfully')
    } catch (error: any) {
      console.error('Report generation failed:', error)
      toast.error(error.response?.data?.detail || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handleViewReport = () => {
    if (!data.sessionId) {
      toast.error('No session found')
      return
    }
    router.push(`/reports/${data.sessionId}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Step 9: Review & Report</span>
          {isComplete ? (
            <Badge variant="success" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready for Report
            </Badge>
          ) : (
            <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Incomplete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Completion Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg flex items-center gap-2 ${hasMaco ? 'bg-green-50' : 'bg-gray-50'}`}>
            {hasMaco ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-gray-400" />}
            <span className="text-sm">Step 3: MACO Calculated</span>
            {hasMaco && <span className="text-xs text-green-600 ml-auto">{data.maco?.lowest_maco?.toFixed(2)} mg</span>}
          </div>
          <div className={`p-3 rounded-lg flex items-center gap-2 ${hasSwabLimit ? 'bg-green-50' : 'bg-gray-50'}`}>
            {hasSwabLimit ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-gray-400" />}
            <span className="text-sm">Step 4: Swab Limit Calculated</span>
            {hasSwabLimit && <span className="text-xs text-green-600 ml-auto">{data.swabLimit?.ppm?.toFixed(2)} ppm</span>}
          </div>
          <div className={`p-3 rounded-lg flex items-center gap-2 ${hasRinseLimit ? 'bg-green-50' : 'bg-gray-50'}`}>
            {hasRinseLimit ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-gray-400" />}
            <span className="text-sm">Step 5: Rinse Limit Calculated</span>
            {hasRinseLimit && <span className="text-xs text-green-600 ml-auto">{data.rinseLimit?.limit_ppm?.toFixed(2)} ppm</span>}
          </div>
          <div className={`p-3 rounded-lg flex items-center gap-2 ${hasStandardPrep ? 'bg-green-50' : 'bg-gray-50'}`}>
            {hasStandardPrep ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-gray-400" />}
            <span className="text-sm">Step 6: Standard Prep Saved</span>
          </div>
          <div className={`p-3 rounded-lg flex items-center gap-2 ${hasSwabResults ? 'bg-green-50' : 'bg-gray-50'}`}>
            {hasSwabResults ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-gray-400" />}
            <span className="text-sm">Step 7: Swab Results ({hasSwabResults ? data.swabResults.length : 0})</span>
          </div>
          <div className={`p-3 rounded-lg flex items-center gap-2 ${hasRinseResults ? 'bg-green-50' : 'bg-gray-50'}`}>
            {hasRinseResults ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-gray-400" />}
            <span className="text-sm">Step 8: Rinse Results ({hasRinseResults ? data.rinseResults.length : 0})</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-pharma-50 rounded-xl text-center">
            <p className="text-xs text-gray-500">Lowest MACO</p>
            <p className="text-xl font-bold text-pharma-700">{data.maco?.lowest_maco?.toFixed(2) || '—'} mg</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-xs text-gray-500">Swab Limit</p>
            <p className="text-xl font-bold text-blue-700">{data.swabLimit?.ppm?.toFixed(2) || '—'} ppm</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl text-center">
            <p className="text-xs text-gray-500">Rinse Limit</p>
            <p className="text-xl font-bold text-green-700">{data.rinseLimit?.limit_ppm?.toFixed(2) || '—'} ppm</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl text-center">
            <p className="text-xs text-gray-500">Total Samples</p>
            <p className="text-xl font-bold text-purple-700">
              {(data.swabResults?.length || 0) + (data.rinseResults?.length || 0)}
            </p>
          </div>
        </div>

        {/* Swab Results Preview */}
        {data.swabResults && data.swabResults.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Swab Results Summary</h4>
            <div className="max-h-32 overflow-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Location</th>
                    <th className="p-2 text-left">Result (ppm)</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.swabResults.slice(0, 5).map((result: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{result.location_name}</td>
                      <td className="p-2">{result.result_ppm?.toFixed(2) || '—'}</td>
                      <td className="p-2">
                        <Badge variant={result.result_ppm < (data.swabLimit?.ppm || 50) ? 'success' : 'destructive'} className="text-xs">
                          {result.result_ppm < (data.swabLimit?.ppm || 50) ? 'PASS' : 'FAIL'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.swabResults.length > 5 && (
                <p className="text-xs text-gray-400 text-center p-1">+{data.swabResults.length - 5} more results</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={handleViewReport}
            variant="outline"
            className="flex-1"
            disabled={!data.sessionId}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Report
          </Button>
          
          <Button 
            onClick={handleGenerateReport}
            disabled={loading || !isComplete || !data.sessionId}
            className="flex-1 bg-pharma-600 hover:bg-pharma-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate & Download PDF Report
              </>
            )}
          </Button>
        </div>

        {/* Warning if incomplete */}
        {!isComplete && (
          <div className="p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Validation Incomplete</p>
              <p className="text-xs mt-1">
                Please complete all previous steps before generating the final report.
                Missing: {!hasMaco && "MACO, "} {!hasSwabLimit && "Swab Limit, "} 
                {!hasRinseLimit && "Rinse Limit, "} {!hasStandardPrep && "Standard Prep, "}
                {!hasSwabResults && "Swab Results, "} {!hasRinseResults && "Rinse Results"}
              </p>
            </div>
          </div>
        )}

        {/* Success message when complete */}
        {isComplete && (
          <div className="p-3 bg-green-50 rounded-lg flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Ready for Final Report!</p>
              <p className="text-xs mt-1">
                All validation steps are complete. Click "Generate & Download PDF Report" to get your 
                professional validation report including all calculations and results.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}