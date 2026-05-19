// src/components/protocols/ProtocolManager.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, Download, Play, CheckCircle, AlertCircle, Loader2, Eye, Plus } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useProducts } from '@/hooks/useProducts'
import { useEquipment } from '@/hooks/useEquipment'

interface Protocol {
  id: number
  protocol_number: string
  title: string
  version: number
  status: string
  prepared_by: string
  prepared_date: string
}

interface Execution {
  id: number
  protocol_id: number
  execution_number: number
  execution_date: string
  visual_result: string
  chemical_result_ppm: number
  overall_result: string
  investigator: string
  deviations: string | null
}

interface ProtocolManagerProps {
  equipmentId?: number
  previousProductId?: number
  nextProductId?: number
}

export function ProtocolManager({ equipmentId, previousProductId, nextProductId }: ProtocolManagerProps) {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('protocols')
  const [formData, setFormData] = useState({
    cleaning_procedure_id: '',
    prepared_by: '',
  })
  const [executionData, setExecutionData] = useState({
    visual_result: 'PASS',
    chemical_result_ppm: 0,
    microbiological_result: 0,
    deviations: '',
    investigator: '',
  })

  const { data: products } = useProducts()
  const { data: equipment } = useEquipment()

  // Fetch protocols
  useEffect(() => {
    fetchProtocols()
  }, [])

  const fetchProtocols = async () => {
    try {
      const res = await api.get('/protocols')
      setProtocols(res.data)
    } catch (error) {
      console.error('Failed to fetch protocols:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExecutions = async (protocolId: number) => {
    try {
      const res = await api.get(`/protocols/${protocolId}/executions`)
      setExecutions(res.data)
    } catch (error) {
      console.error('Failed to fetch executions:', error)
    }
  }

  const generateProtocol = async () => {
    if (!formData.cleaning_procedure_id || !formData.prepared_by) {
      toast.error('Please fill all fields')
      return
    }
    if (!equipmentId || !previousProductId || !nextProductId) {
      toast.error('Please select equipment and products first')
      return
    }

    setGenerating(true)
    try {
      const res = await api.post('/protocols/create', {
        equipment_id: equipmentId,
        previous_product_id: previousProductId,
        next_product_id: nextProductId,
        cleaning_procedure_id: formData.cleaning_procedure_id,
        prepared_by: formData.prepared_by,
      })
      
      toast.success('Protocol generated successfully')
      setShowGenerateDialog(false)
      fetchProtocols()
      setSelectedProtocol(res.data)
      setFormData({ cleaning_procedure_id: '', prepared_by: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate protocol')
    } finally {
      setGenerating(false)
    }
  }

  const executeProtocol = async () => {
    if (!selectedProtocol) {
      toast.error('No protocol selected')
      return
    }
    if (!executionData.investigator) {
      toast.error('Please enter investigator name')
      return
    }

    const nextExecutionNumber = executions.length + 1
    
    try {
      const res = await api.post('/protocols/execute', {
        protocol_id: selectedProtocol.id,
        execution_number: nextExecutionNumber,
        visual_result: executionData.visual_result,
        chemical_result_ppm: executionData.chemical_result_ppm,
        microbiological_result: executionData.microbiological_result || null,
        deviations: executionData.deviations || null,
        investigator: executionData.investigator,
      })
      
      toast.success(`Execution ${nextExecutionNumber} recorded`)
      fetchExecutions(selectedProtocol.id)
      
      setExecutionData({
        visual_result: 'PASS',
        chemical_result_ppm: 0,
        microbiological_result: 0,
        deviations: '',
        investigator: '',
      })
      
      if (res.data.consecutive_passes >= 3) {
        toast.success('🎉 Validation complete! 3 consecutive passes achieved.')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to execute protocol')
    }
  }

  const downloadProtocol = async (protocolId: number, protocolNumber: string) => {
    try {
      const response = await api.get(`/protocols/${protocolId}/pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `validation_protocol_${protocolNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Protocol downloaded')
    } catch (error) {
      toast.error('Failed to download protocol')
    }
  }

  const handleSelectProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol)
    fetchExecutions(protocol.id)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'EXECUTED':
        return <Badge className="bg-blue-100 text-blue-800">Executed</Badge>
      case 'DRAFT':
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getOverallPassStatus = () => {
    if (executions.length === 0) return null
    const recentExecutions = executions.slice(-3)
    const allPassed = recentExecutions.every(e => e.overall_result === 'PASS')
    if (recentExecutions.length >= 3 && allPassed) {
      return { passed: true, message: '✓ Validation Complete - 3 Consecutive Passes' }
    }
    return { passed: false, message: `${recentExecutions.length}/3 consecutive passes achieved` }
  }

  const passStatus = getOverallPassStatus()
  const isExecutionDisabled = !selectedProtocol

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-pharma-600" />
          Validation Protocol Manager (Section 9.0)
        </CardTitle>
        <Button onClick={() => setShowGenerateDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Generate Protocol
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'protocols'
                  ? 'border-b-2 border-pharma-600 text-pharma-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('protocols')}
            >
              Protocols
            </button>
            <button
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                isExecutionDisabled ? 'opacity-50 cursor-not-allowed text-gray-400' : ''
              } ${
                activeTab === 'execution' && !isExecutionDisabled
                  ? 'border-b-2 border-pharma-600 text-pharma-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => !isExecutionDisabled && setActiveTab('execution')}
              disabled={isExecutionDisabled}
            >
              Execute Protocol
            </button>
            <button
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                isExecutionDisabled ? 'opacity-50 cursor-not-allowed text-gray-400' : ''
              } ${
                activeTab === 'history' && !isExecutionDisabled
                  ? 'border-b-2 border-pharma-600 text-pharma-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => !isExecutionDisabled && setActiveTab('history')}
              disabled={isExecutionDisabled}
            >
              Execution History
            </button>
          </div>
        </div>

        {/* Protocols Tab */}
        {activeTab === 'protocols' && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocol Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prepared By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {protocols.map((protocol) => (
                  <TableRow 
                    key={protocol.id}
                    className={selectedProtocol?.id === protocol.id ? 'bg-pharma-50 cursor-pointer' : 'cursor-pointer'}
                    onClick={() => handleSelectProtocol(protocol)}
                  >
                    <TableCell className="font-mono text-sm">{protocol.protocol_number}</TableCell>
                    <TableCell>{protocol.title}</TableCell>
                    <TableCell>v{protocol.version}</TableCell>
                    <TableCell>{getStatusBadge(protocol.status)}</TableCell>
                    <TableCell>{protocol.prepared_by}</TableCell>
                    <TableCell>{new Date(protocol.prepared_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          downloadProtocol(protocol.id, protocol.protocol_number)
                        }}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          handleSelectProtocol(protocol)
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {protocols.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No protocols generated. Click "Generate Protocol" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Execution Tab */}
        {activeTab === 'execution' && selectedProtocol && (
          <div className="space-y-6">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-800">Protocol: {selectedProtocol.protocol_number}</p>
              <p className="text-sm text-purple-700">{selectedProtocol.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visual-result">Visual Inspection Result</Label>
                <select
                  id="visual-result"
                  className="w-full p-2 border rounded-md"
                  value={executionData.visual_result}
                  onChange={(e) => setExecutionData({ ...executionData, visual_result: e.target.value })}
                  aria-label="Visual Inspection Result"
                  title="Visual Inspection Result"
                >
                  <option value="PASS">PASS - No visible residue</option>
                  <option value="FAIL">FAIL - Visible residue observed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chemical-result">Chemical Result (ppm)</Label>
                <Input
                  id="chemical-result"
                  type="number"
                  step="0.01"
                  value={executionData.chemical_result_ppm}
                  onChange={(e) => setExecutionData({ ...executionData, chemical_result_ppm: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="microbiological-result">Microbiological Result (CFU/dm²)</Label>
                <Input
                  id="microbiological-result"
                  type="number"
                  step="1"
                  value={executionData.microbiological_result}
                  onChange={(e) => setExecutionData({ ...executionData, microbiological_result: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investigator">Investigator Name</Label>
                <Input
                  id="investigator"
                  value={executionData.investigator}
                  onChange={(e) => setExecutionData({ ...executionData, investigator: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="deviations">Deviations (if any)</Label>
                <Textarea
                  id="deviations"
                  rows={3}
                  value={executionData.deviations}
                  onChange={(e) => setExecutionData({ ...executionData, deviations: e.target.value })}
                  placeholder="Describe any deviations from the protocol..."
                />
              </div>
            </div>

            {passStatus && (
              <div className={`p-3 rounded-lg ${passStatus.passed ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="flex items-center gap-2">
                  {passStatus.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <p className={passStatus.passed ? 'text-green-800' : 'text-yellow-800'}>
                    {passStatus.message}
                  </p>
                </div>
              </div>
            )}

            <Button onClick={executeProtocol} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Record Execution #{executions.length + 1}
            </Button>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && selectedProtocol && (
          <div>
            {executions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Visual</TableHead>
                      <TableHead>Chemical (ppm)</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Investigator</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map((exec) => (
                      <TableRow key={exec.id}>
                        <TableCell>{exec.execution_number}</TableCell>
                        <TableCell>{new Date(exec.execution_date).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={exec.visual_result === 'PASS' ? 'default' : 'destructive'}>
                            {exec.visual_result}
                          </Badge>
                        </TableCell>
                        <TableCell>{exec.chemical_result_ppm}</TableCell>
                        <TableCell>
                          <Badge variant={exec.overall_result === 'PASS' ? 'default' : 'destructive'}>
                            {exec.overall_result}
                          </Badge>
                        </TableCell>
                        <TableCell>{exec.investigator}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No executions recorded yet for this protocol.
              </div>
            )}
          </div>
        )}

        {/* Empty state for execution/history when no protocol selected */}
        {activeTab !== 'protocols' && !selectedProtocol && (
          <div className="text-center py-8 text-gray-500">
            Please select a protocol from the Protocols tab first.
          </div>
        )}
      </CardContent>

      {/* Generate Protocol Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Validation Protocol</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cleaning-procedure-id">Cleaning Procedure ID *</Label>
              <Input
                id="cleaning-procedure-id"
                placeholder="e.g., SOP-CLEAN-001"
                value={formData.cleaning_procedure_id}
                onChange={(e) => setFormData({ ...formData, cleaning_procedure_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepared-by">Prepared By *</Label>
              <Input
                id="prepared-by"
                placeholder="Your name"
                value={formData.prepared_by}
                onChange={(e) => setFormData({ ...formData, prepared_by: e.target.value })}
              />
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-medium text-blue-800">Protocol will include:</p>
              <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
                <li>Background, Purpose, Scope, Responsibilities</li>
                <li>Sampling Procedure & Testing Procedure</li>
                <li>Acceptance Criteria & Training Requirements</li>
                <li>Deviations & Revalidation Strategy</li>
              </ul>
            </div>
            <Button onClick={generateProtocol} disabled={generating} className="w-full">
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              {generating ? 'Generating...' : 'Generate Protocol'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}