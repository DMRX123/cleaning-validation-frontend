// src/components/fmea/FMEAMatrix.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { useFMEAAssessments, useCreateFMEA, useDeleteFMEA } from '@/hooks/useFMEA'
import { useEquipment } from '@/hooks/useEquipment'
import toast from 'react-hot-toast'

interface FMEAMatrixProps {
  equipmentId?: number
}

export function FMEAMatrix({ equipmentId }: FMEAMatrixProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(equipmentId || null)
  const [formData, setFormData] = useState({
    failure_mode: '',
    location_description: '',
    severity: 5,
    occurrence: 5,
    detection: 5,
    is_sampling_point: true,
    sampling_method: 'swab',
    sampling_area_cm2: 100,
    justification: '',
  })

  const { data: assessments, refetch } = useFMEAAssessments(selectedEquipment || undefined)
  const { data: equipmentList } = useEquipment()
  const createFMEA = useCreateFMEA()
  const deleteFMEA = useDeleteFMEA()

  const calculateRPN = (severity: number, occurrence: number, detection: number) => {
    return severity * occurrence * detection
  }

  const getRiskLevel = (rpn: number) => {
    if (rpn < 70) return { level: 'Low', color: 'bg-green-100 text-green-800' }
    if (rpn <= 150) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
    return { level: 'High', color: 'bg-red-100 text-red-800' }
  }

  const getSeverityLabel = (value: number) => {
    if (value <= 2) return 'Minor'
    if (value <= 4) return 'Moderate'
    if (value <= 6) return 'Significant'
    if (value <= 8) return 'Major'
    return 'Severe'
  }

  const getOccurrenceLabel = (value: number) => {
    if (value <= 2) return 'Rare'
    if (value <= 4) return 'Unlikely'
    if (value <= 6) return 'Possible'
    if (value <= 8) return 'Likely'
    return 'Almost Certain'
  }

  const getDetectionLabel = (value: number) => {
    if (value <= 2) return 'Almost Certain'
    if (value <= 4) return 'High'
    if (value <= 6) return 'Medium'
    if (value <= 8) return 'Low'
    return 'Almost Impossible'
  }

  const handleSubmit = async () => {
    if (!selectedEquipment) {
      toast.error('Please select equipment')
      return
    }
    if (!formData.failure_mode) {
      toast.error('Please enter failure mode')
      return
    }

    await createFMEA.mutateAsync({
      equipment_id: selectedEquipment,
      failure_mode: formData.failure_mode,
      location_description: formData.location_description,
      severity: formData.severity,
      occurrence: formData.occurrence,
      detection: formData.detection,
      is_sampling_point: formData.is_sampling_point,
      sampling_method: formData.sampling_method,
      sampling_area_cm2: formData.sampling_area_cm2,
      justification: formData.justification,
    })

    setIsDialogOpen(false)
    setFormData({
      failure_mode: '',
      location_description: '',
      severity: 5,
      occurrence: 5,
      detection: 5,
      is_sampling_point: true,
      sampling_method: 'swab',
      sampling_area_cm2: 100,
      justification: '',
    })
    refetch()
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this FMEA assessment?')) {
      await deleteFMEA.mutateAsync(id)
      refetch()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-pharma-600" />
          FMEA Risk Assessment (Section 8.1)
        </CardTitle>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Assessment
        </Button>
      </CardHeader>
      <CardContent>
        {/* Equipment Filter */}
        {!equipmentId && (
          <div className="mb-4">
            <Label htmlFor="equipment-filter">Filter by Equipment</Label>
            <select
              id="equipment-filter"
              className="w-full mt-1 p-2 border rounded-md"
              value={selectedEquipment || ''}
              onChange={(e) => setSelectedEquipment(parseInt(e.target.value) || null)}
              aria-label="Filter by Equipment"
              title="Filter by Equipment"
            >
              <option value="">All Equipment</option>
              {equipmentList?.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.equipment_id})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* FMEA Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Failure Mode</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center">S</TableHead>
                <TableHead className="text-center">O</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">RPN</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Sampling Point</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments?.map((assessment) => {
                const rpn = calculateRPN(assessment.severity, assessment.occurrence, assessment.detection)
                const risk = getRiskLevel(rpn)
                return (
                  <TableRow key={assessment.id}>
                    <TableCell>{assessment.equipment_name || `ID: ${assessment.equipment_id}`}</TableCell>
                    <TableCell className="font-medium">{assessment.failure_mode}</TableCell>
                    <TableCell className="text-sm text-gray-500">{assessment.location_description || '-'}</TableCell>
                    <TableCell className="text-center">
                      <span title={getSeverityLabel(assessment.severity)}>{assessment.severity}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span title={getOccurrenceLabel(assessment.occurrence)}>{assessment.occurrence}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span title={getDetectionLabel(assessment.detection)}>{assessment.detection}</span>
                    </TableCell>
                    <TableCell className="text-center font-bold">{rpn}</TableCell>
                    <TableCell>
                      <Badge className={risk.color}>{risk.level}</Badge>
                    </TableCell>
                    <TableCell>
                      {assessment.is_sampling_point ? (
                        <Badge className="bg-green-100 text-green-800">
                          {assessment.sampling_method?.toUpperCase()}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(assessment.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {(!assessments || assessments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    No FMEA assessments. Click "Add Assessment" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* FMEA Reference */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
          <p className="font-medium text-blue-800">RPN = Severity × Occurrence × Detection</p>
          <p className="text-xs text-blue-600 mt-1">
            RPN ≥ 150: High Risk - Requires immediate action<br />
            RPN 70-149: Medium Risk - Monitor and implement controls<br />
            RPN &lt; 70: Low Risk - Acceptable
          </p>
        </div>
      </CardContent>

      {/* Add FMEA Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add FMEA Risk Assessment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!equipmentId && (
              <div className="space-y-2">
                <Label htmlFor="fmea-equipment">Equipment *</Label>
                <select
                  id="fmea-equipment"
                  className="w-full p-2 border rounded-md"
                  value={selectedEquipment || ''}
                  onChange={(e) => setSelectedEquipment(parseInt(e.target.value))}
                  aria-label="Select Equipment"
                  title="Select Equipment"
                >
                  <option value="">Select Equipment</option>
                  {equipmentList?.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.equipment_id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="failure-mode">Failure Mode *</Label>
              <Input
                id="failure-mode"
                placeholder="e.g., Residue accumulation at weld joint"
                value={formData.failure_mode}
                onChange={(e) => setFormData({ ...formData, failure_mode: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location-desc">Location Description</Label>
              <Input
                id="location-desc"
                placeholder="e.g., Upper dome near agitator shaft"
                value={formData.location_description}
                onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity (1-10)</Label>
                <Input
                  id="severity"
                  type="range"
                  min={1}
                  max={10}
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500">{getSeverityLabel(formData.severity)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="occurrence">Occurrence (1-10)</Label>
                <Input
                  id="occurrence"
                  type="range"
                  min={1}
                  max={10}
                  value={formData.occurrence}
                  onChange={(e) => setFormData({ ...formData, occurrence: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500">{getOccurrenceLabel(formData.occurrence)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="detection">Detection (1-10)</Label>
                <Input
                  id="detection"
                  type="range"
                  min={1}
                  max={10}
                  value={formData.detection}
                  onChange={(e) => setFormData({ ...formData, detection: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500">{getDetectionLabel(formData.detection)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sampling-point">Sampling Point</Label>
                <select
                  id="sampling-point"
                  className="w-full p-2 border rounded-md"
                  value={formData.is_sampling_point ? 'yes' : 'no'}
                  onChange={(e) => setFormData({ ...formData, is_sampling_point: e.target.value === 'yes' })}
                  aria-label="Is Sampling Point"
                  title="Is Sampling Point"
                >
                  <option value="yes">Yes - Include as sampling point</option>
                  <option value="no">No - Not a sampling point</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sampling-method">Sampling Method</Label>
                <select
                  id="sampling-method"
                  className="w-full p-2 border rounded-md"
                  value={formData.sampling_method}
                  onChange={(e) => setFormData({ ...formData, sampling_method: e.target.value })}
                  disabled={!formData.is_sampling_point}
                  aria-label="Sampling Method"
                  title="Sampling Method"
                >
                  <option value="swab">Swab Sampling</option>
                  <option value="rinse">Rinse Sampling</option>
                  <option value="contact_plate">Contact Plate</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sampling-area">Sampling Area (cm²)</Label>
              <Input
                id="sampling-area"
                type="number"
                value={formData.sampling_area_cm2}
                onChange={(e) => setFormData({ ...formData, sampling_area_cm2: parseFloat(e.target.value) })}
                disabled={!formData.is_sampling_point}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justification</Label>
              <Input
                id="justification"
                placeholder="Why is this a risk? What controls are in place?"
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} disabled={createFMEA.isPending}>
                {createFMEA.isPending ? 'Saving...' : 'Save Assessment'}
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}