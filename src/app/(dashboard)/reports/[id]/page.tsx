'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'

interface SwabResult {
  location_name: string
  result_ppm: number
  result_ppm_display?: string
  reported: string
  below_loq?: boolean
}

interface RinseResult {
  equipment_name: string
  result_ppm: number
  result_ppm_display?: string
  reported: string
  below_loq?: boolean
}

interface ReportDetail {
  id: number
  session_code: string
  status: string
  created_at: string
  lowest_maco: number
  swab_limit_ppm: number
  rinse_limit_ppm: number
  previous_product: { name: string; min_batch_size: number; max_batch_size: number }
  next_product: { name: string; min_batch_size: number; max_batch_size: number; solubility: string }
  swab_results: SwabResult[]
  rinse_results: RinseResult[]
}

export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [reportId])

  const fetchReport = async () => {
    try {
      const res = await api.get(`/validation/session/${reportId}`)
      setReport(res.data)
    } catch (error) {
      toast.error('Failed to fetch report details')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    try {
      const response = await api.get(`/reports/${reportId}/pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `validation_report_${report?.session_code}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Report downloaded')
    } catch (error) {
      toast.error('Failed to download report')
    }
  }

  // Helper function to format PPM display
  const formatPpmDisplay = (result: SwabResult | RinseResult): string => {
    if (result.result_ppm_display) return result.result_ppm_display
    if (result.below_loq) return 'Below LOQ'
    if (typeof result.result_ppm === 'number' && result.result_ppm > 0) return result.result_ppm.toFixed(2)
    return result.reported || '0'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Report not found</p>
            <Link href="/reports">
              <Button className="mt-4">Back to Reports</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const allPassed = report.swab_results?.every(r => 
    r.reported !== 'Below LOQ' && (r.result_ppm || 0) < 50
  ) ?? true

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Link href="/reports" className="text-pharma-600 hover:underline flex items-center gap-1 mb-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Reports
                </Link>
                <h1 className="text-2xl font-bold text-pharma-700">Validation Report</h1>
                <p className="text-gray-500 font-mono text-sm">{report.session_code}</p>
              </div>
              <Button onClick={downloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            {/* Status Card */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {allPassed ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <h2 className="font-semibold text-green-800">Validation PASSED</h2>
                        <p className="text-sm text-green-700">All results are within acceptable limits</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-8 w-8 text-red-600" />
                      <div>
                        <h2 className="font-semibold text-red-800">Validation Needs Review</h2>
                        <p className="text-sm text-red-700">Some results exceeded acceptable limits</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Previous Product</p>
                    <p className="font-medium">{report.previous_product?.name}</p>
                    <p className="text-sm text-gray-500">Batch Size: {report.previous_product?.min_batch_size} - {report.previous_product?.max_batch_size} kg</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Next Product</p>
                    <p className="font-medium">{report.next_product?.name}</p>
                    <p className="text-sm text-gray-500">Solubility: {report.next_product?.solubility}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MACO Results */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>MACO Calculation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">10 ppm Method</p>
                    <p className="text-xl font-bold text-pharma-600">{report.lowest_maco} mg</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">TDD Method</p>
                    <p className="text-xl font-bold text-pharma-600">{report.lowest_maco} mg</p>
                  </div>
                  <div className="text-center p-3 bg-pharma-100 rounded">
                    <p className="text-sm text-gray-600">Lowest MACO Used</p>
                    <p className="text-xl font-bold text-pharma-700">{report.lowest_maco} mg</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Swab Results */}
            {report.swab_results && report.swab_results.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Swab Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Location</th>
                        <th className="text-left py-2">Result (ppm)</th>
                        <th className="text-left py-2">Status</th>
                       </tr>
                    </thead>
                    <tbody>
                      {report.swab_results.map((result, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{result.location_name}</td>
                          <td className="py-2">{formatPpmDisplay(result)}</td>
                          <td className="py-2">
                            <Badge variant={result.reported === 'Below LOQ' ? 'outline' : 'default'}>
                              {result.reported === 'Below LOQ' ? 'Below LOQ' : 'Acceptable'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {/* Rinse Results */}
            {report.rinse_results && report.rinse_results.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Rinse Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Equipment</th>
                        <th className="text-left py-2">Result (ppm)</th>
                        <th className="text-left py-2">Status</th>
                       </tr>
                    </thead>
                    <tbody>
                      {report.rinse_results.map((result, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{result.equipment_name}</td>
                          <td className="py-2">{formatPpmDisplay(result)}</td>
                          <td className="py-2">
                            <Badge variant={result.reported === 'Below LOQ' ? 'outline' : 'default'}>
                              {result.reported === 'Below LOQ' ? 'Below LOQ' : 'Acceptable'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}