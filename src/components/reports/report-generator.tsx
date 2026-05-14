'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FileText, Download, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface ReportGeneratorProps {
  sessions: Array<{ id: number; session_code: string; status: string }>
}

export function ReportGenerator({ sessions }: ReportGeneratorProps) {
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    if (!selectedSession) {
      toast.error('Please select a session')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/reports/${selectedSession}/pdf`, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const session = sessions.find(s => s.id.toString() === selectedSession)
      link.setAttribute('download', `validation_report_${session?.session_code || selectedSession}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Report generated successfully')
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Validation Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Validation Session</Label>
          <Select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">Select a session...</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.session_code} - {session.status}
              </option>
            ))}
          </Select>
        </div>

        <Button onClick={generateReport} disabled={loading || !selectedSession} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate PDF Report
            </>
          )}
        </Button>

        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Report includes:</strong> Session Information, Product Details, 
            MACO Calculations, Equipment Details, Swab Results, Rinse Results, 
            Conclusion, and Authorized Signatory.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}