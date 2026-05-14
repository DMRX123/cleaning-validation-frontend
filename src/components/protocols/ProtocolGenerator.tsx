'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Download, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface ProtocolGeneratorProps {
  equipmentId: number
  previousProductId: number
  nextProductId: number
}

export function ProtocolGenerator({ equipmentId, previousProductId, nextProductId }: ProtocolGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [protocolId, setProtocolId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    cleaning_procedure_id: '',
    prepared_by: ''
  })

  const generateProtocol = async () => {
    if (!formData.cleaning_procedure_id || !formData.prepared_by) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/protocols/create', {
        equipment_id: equipmentId,
        previous_product_id: previousProductId,
        next_product_id: nextProductId,
        cleaning_procedure_id: formData.cleaning_procedure_id,
        prepared_by: formData.prepared_by
      })
      setProtocolId(res.data.id)
      setGenerated(true)
      toast.success('Protocol generated successfully')
    } catch (error) {
      toast.error('Failed to generate protocol')
    } finally {
      setLoading(false)
    }
  }

  const downloadProtocol = async () => {
    if (!protocolId) return
    try {
      const response = await api.get(`/protocols/${protocolId}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `validation_protocol_${protocolId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Protocol downloaded')
    } catch (error) {
      toast.error('Failed to download protocol')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Validation Protocol Generator (Section 9.0)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cleaning Procedure ID *</Label>
            <Input
              placeholder="e.g., SOP-CLEAN-001"
              value={formData.cleaning_procedure_id}
              onChange={(e) => setFormData({ ...formData, cleaning_procedure_id: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Prepared By *</Label>
            <Input
              placeholder="Your name"
              value={formData.prepared_by}
              onChange={(e) => setFormData({ ...formData, prepared_by: e.target.value })}
            />
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Protocol will include:</strong> Background, Purpose, Scope, Responsibilities,
            Sampling Procedure, Testing Procedure, Acceptance Criteria, Training Requirements,
            Deviations, Revalidation Strategy
          </p>
        </div>

        <Button onClick={generateProtocol} disabled={loading} className="w-full">
          {loading ? 'Generating...' : 'Generate Validation Protocol'}
        </Button>

        {generated && (
          <div className="p-3 bg-green-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">Protocol generated successfully!</span>
            </div>
            <Button variant="outline" onClick={downloadProtocol}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}