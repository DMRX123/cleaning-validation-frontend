'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ClipboardCheck, AlertTriangle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface ProtocolExecutionProps {
  protocolId: number
  onComplete?: () => void
}

export function ProtocolExecution({ protocolId, onComplete }: ProtocolExecutionProps) {
  const [loading, setLoading] = useState(false)
  const [executionNumber, setExecutionNumber] = useState(1)
  const [formData, setFormData] = useState({
    visual_result: 'PASS',
    chemical_result_ppm: 0,
    microbiological_result: 0,
    deviations: '',
    investigator: ''
  })

  const executeProtocol = async () => {
    if (!formData.investigator) {
      toast.error('Please enter investigator name')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/protocols/execute', {
        protocol_id: protocolId,
        execution_number: executionNumber,
        visual_result: formData.visual_result,
        chemical_result_ppm: parseFloat(formData.chemical_result_ppm as any),
        microbiological_result: formData.microbiological_result ? parseFloat(formData.microbiological_result as any) : null,
        deviations: formData.deviations || null,
        investigator: formData.investigator
      })
      
      toast.success(`Execution ${executionNumber} recorded`)
      
      if (res.data.replicates_completed >= 3) {
        toast.success('All 3 replicates completed! Protocol is now APPROVED.')
        if (onComplete) onComplete()
      } else {
        setExecutionNumber(prev => prev + 1)
        setFormData({
          visual_result: 'PASS',
          chemical_result_ppm: 0,
          microbiological_result: 0,
          deviations: '',
          investigator: formData.investigator
        })
      }
    } catch (error) {
      toast.error('Failed to execute protocol')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Protocol Execution (Section 9.0)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Execution #{executionNumber} of 3</strong> - Three consecutive successful cleans are required for validation
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Visual Inspection Result</Label>
            <Select
              value={formData.visual_result}
              onChange={(e) => setFormData({ ...formData, visual_result: e.target.value })}
            >
              <option value="PASS">PASS - No visible residue</option>
              <option value="FAIL">FAIL - Visible residue observed</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Chemical Result (ppm)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.chemical_result_ppm}
              onChange={(e) => setFormData({ ...formData, chemical_result_ppm: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Microbiological Result (CFU/dm²)</Label>
            <Input
              type="number"
              step="1"
              value={formData.microbiological_result}
              onChange={(e) => setFormData({ ...formData, microbiological_result: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Investigator Name</Label>
            <Input
              value={formData.investigator}
              onChange={(e) => setFormData({ ...formData, investigator: e.target.value })}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Deviations (if any)</Label>
            <Textarea
              rows={3}
              value={formData.deviations}
              onChange={(e) => setFormData({ ...formData, deviations: e.target.value })}
              placeholder="Describe any deviations from the protocol..."
            />
          </div>
        </div>

        <Button onClick={executeProtocol} disabled={loading} className="w-full">
          {loading ? 'Recording...' : `Record Execution #${executionNumber}`}
        </Button>

        <div className="p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> All three consecutive executions must PASS for the cleaning procedure to be validated.
            If any execution fails, investigate root cause and restart the validation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
