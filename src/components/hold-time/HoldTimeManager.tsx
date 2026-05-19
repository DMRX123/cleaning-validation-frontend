// src/components/hold-time/HoldTimeManager.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Plus, Trash2, CheckCircle } from 'lucide-react'
import {
  useDirtyHoldTimes,
  useCreateDirtyHoldTime,
  useDeleteDirtyHoldTime,
  useCleanHoldTimes,
  useCreateCleanHoldTime,
  useDeleteCleanHoldTime,
  useHoldTimeValidations,
  useApproveHoldTimeValidation,
} from '@/hooks/useHoldTime'
import { useEquipment } from '@/hooks/useEquipment'
import toast from 'react-hot-toast'

export function HoldTimeManager() {
  const [showDhtDialog, setShowDhtDialog] = useState(false)
  const [showChtDialog, setShowChtDialog] = useState(false)
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [selectedValidation, setSelectedValidation] = useState<any>(null)

  const { data: equipment } = useEquipment()
  const { data: dhtRecords, refetch: refetchDht } = useDirtyHoldTimes()
  const { data: chtRecords, refetch: refetchCht } = useCleanHoldTimes()
  const { data: validations, refetch: refetchValidations } = useHoldTimeValidations()

  const createDht = useCreateDirtyHoldTime()
  const deleteDht = useDeleteDirtyHoldTime()
  const createCht = useCreateCleanHoldTime()
  const deleteCht = useDeleteCleanHoldTime()
  const approveValidation = useApproveHoldTimeValidation()

  const [dhtForm, setDhtForm] = useState({
    equipment_id: 0,
    product_name: '',
    batch_number: '',
    end_of_batch_time: '',
    cleaning_start_time: '',
    max_validated_dht_hours: 24,
    created_by: '',
  })

  const [chtForm, setChtForm] = useState({
    equipment_id: 0,
    cleaning_completion_time: '',
    next_use_time: '',
    max_validated_cht_hours: 72,
    storage_conditions: 'Covered, dry, room temperature',
    created_by: '',
  })

  const handleDhtSubmit = async () => {
    if (!dhtForm.equipment_id || !dhtForm.product_name || !dhtForm.batch_number) {
      toast.error('Please fill all required fields')
      return
    }

    await createDht.mutateAsync(dhtForm)
    setShowDhtDialog(false)
    setDhtForm({
      equipment_id: 0,
      product_name: '',
      batch_number: '',
      end_of_batch_time: '',
      cleaning_start_time: '',
      max_validated_dht_hours: 24,
      created_by: '',
    })
    refetchDht()
  }

  const handleChtSubmit = async () => {
    if (!chtForm.equipment_id) {
      toast.error('Please select equipment')
      return
    }

    await createCht.mutateAsync(chtForm)
    setShowChtDialog(false)
    setChtForm({
      equipment_id: 0,
      cleaning_completion_time: '',
      next_use_time: '',
      max_validated_cht_hours: 72,
      storage_conditions: 'Covered, dry, room temperature',
      created_by: '',
    })
    refetchCht()
  }

  const handleDeleteDht = async (id: number) => {
    if (confirm('Are you sure you want to delete this DHT record?')) {
      await deleteDht.mutateAsync(id)
      refetchDht()
    }
  }

  const handleDeleteCht = async (id: number) => {
    if (confirm('Are you sure you want to delete this CHT record?')) {
      await deleteCht.mutateAsync(id)
      refetchCht()
    }
  }

  const getEquipmentName = (id: number) => {
    return equipment?.find(e => e.id === id)?.name || `ID: ${id}`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-pharma-600" />
          Hold Time Management (Section 9.7)
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={() => setShowDhtDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Record DHT
          </Button>
          <Button onClick={() => setShowChtDialog(true)} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Record CHT
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dht">
          <TabsList className="mb-6">
            <TabsTrigger value="dht">Dirty Hold Time (DHT)</TabsTrigger>
            <TabsTrigger value="cht">Clean Hold Time (CHT)</TabsTrigger>
            <TabsTrigger value="validation">Validation Records</TabsTrigger>
          </TabsList>

          {/* DHT Tab */}
          <TabsContent value="dht">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Actual DHT (hrs)</TableHead>
                    <TableHead>Limit (hrs)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dhtRecords?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{getEquipmentName(record.equipment_id)}</TableCell>
                      <TableCell>{record.product_name}</TableCell>
                      <TableCell className="font-mono text-sm">{record.batch_number}</TableCell>
                      <TableCell>{record.actual_dht_hours}</TableCell>
                      <TableCell>{record.max_validated_dht_hours}</TableCell>
                      <TableCell>
                        <Badge className={record.is_within_limit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {record.is_within_limit ? 'PASS' : 'FAIL'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDht(record.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!dhtRecords || dhtRecords.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No DHT records. Click "Record DHT" to add one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* CHT Tab */}
          <TabsContent value="cht">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Actual CHT (hrs)</TableHead>
                    <TableHead>Limit (hrs)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Storage Conditions</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chtRecords?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{getEquipmentName(record.equipment_id)}</TableCell>
                      <TableCell>{record.actual_cht_hours}</TableCell>
                      <TableCell>{record.max_validated_cht_hours}</TableCell>
                      <TableCell>
                        <Badge className={record.is_within_limit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {record.is_within_limit ? 'PASS' : 'FAIL'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{record.storage_conditions}</TableCell>
                      <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCht(record.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!chtRecords || chtRecords.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No CHT records. Click "Record CHT" to add one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Validation Tab */}
          <TabsContent value="validation">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Hold Type</TableHead>
                    <TableHead>Validated Hours</TableHead>
                    <TableHead>Tested Hours</TableHead>
                    <TableHead>Successful Runs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validations?.map((val) => (
                    <TableRow key={val.id}>
                      <TableCell>{getEquipmentName(val.equipment_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{val.hold_type}</Badge>
                      </TableCell>
                      <TableCell>{val.validated_hours} hrs</TableCell>
                      <TableCell>{val.tested_hours} hrs</TableCell>
                      <TableCell>{val.number_of_successful_runs}/{val.required_runs}</TableCell>
                      <TableCell>
                        <Badge className={val.is_validated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {val.is_validated ? 'Validated' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{val.expiry_date ? new Date(val.expiry_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        {!val.is_validated && (
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedValidation(val)
                            setShowValidationDialog(true)
                          }}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!validations || validations.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No validation records. Complete DHT/CHT studies to create validation records.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* DHT Dialog */}
      <Dialog open={showDhtDialog} onOpenChange={setShowDhtDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Dirty Hold Time (DHT)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dht-equipment">Equipment *</Label>
              <select
                id="dht-equipment"
                className="w-full p-2 border rounded-md"
                value={dhtForm.equipment_id}
                onChange={(e) => setDhtForm({ ...dhtForm, equipment_id: parseInt(e.target.value) })}
                aria-label="Select Equipment"
                title="Select Equipment"
              >
                <option value="">Select Equipment</option>
                {equipment?.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({eq.equipment_id})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dht-product">Product Name *</Label>
              <Input
                id="dht-product"
                value={dhtForm.product_name}
                onChange={(e) => setDhtForm({ ...dhtForm, product_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dht-batch">Batch Number *</Label>
              <Input
                id="dht-batch"
                value={dhtForm.batch_number}
                onChange={(e) => setDhtForm({ ...dhtForm, batch_number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dht-end-time">End of Batch Time *</Label>
                <Input
                  id="dht-end-time"
                  type="datetime-local"
                  value={dhtForm.end_of_batch_time}
                  onChange={(e) => setDhtForm({ ...dhtForm, end_of_batch_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dht-start-time">Cleaning Start Time *</Label>
                <Input
                  id="dht-start-time"
                  type="datetime-local"
                  value={dhtForm.cleaning_start_time}
                  onChange={(e) => setDhtForm({ ...dhtForm, cleaning_start_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dht-limit">Max Validated DHT (hours)</Label>
              <Input
                id="dht-limit"
                type="number"
                value={dhtForm.max_validated_dht_hours}
                onChange={(e) => setDhtForm({ ...dhtForm, max_validated_dht_hours: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dht-created-by">Created By</Label>
              <Input
                id="dht-created-by"
                value={dhtForm.created_by}
                onChange={(e) => setDhtForm({ ...dhtForm, created_by: e.target.value })}
              />
            </div>
            <Button onClick={handleDhtSubmit} disabled={createDht.isPending}>
              {createDht.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CHT Dialog */}
      <Dialog open={showChtDialog} onOpenChange={setShowChtDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Clean Hold Time (CHT)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cht-equipment">Equipment *</Label>
              <select
                id="cht-equipment"
                className="w-full p-2 border rounded-md"
                value={chtForm.equipment_id}
                onChange={(e) => setChtForm({ ...chtForm, equipment_id: parseInt(e.target.value) })}
                aria-label="Select Equipment"
                title="Select Equipment"
              >
                <option value="">Select Equipment</option>
                {equipment?.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({eq.equipment_id})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cht-completion-time">Cleaning Completion Time *</Label>
                <Input
                  id="cht-completion-time"
                  type="datetime-local"
                  value={chtForm.cleaning_completion_time}
                  onChange={(e) => setChtForm({ ...chtForm, cleaning_completion_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cht-next-use">Next Use Time *</Label>
                <Input
                  id="cht-next-use"
                  type="datetime-local"
                  value={chtForm.next_use_time}
                  onChange={(e) => setChtForm({ ...chtForm, next_use_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cht-limit">Max Validated CHT (hours)</Label>
              <Input
                id="cht-limit"
                type="number"
                value={chtForm.max_validated_cht_hours}
                onChange={(e) => setChtForm({ ...chtForm, max_validated_cht_hours: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cht-storage">Storage Conditions</Label>
              <Input
                id="cht-storage"
                value={chtForm.storage_conditions}
                onChange={(e) => setChtForm({ ...chtForm, storage_conditions: e.target.value })}
              />
            </div>
            <Button onClick={handleChtSubmit} disabled={createCht.isPending}>
              {createCht.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Validation Approval Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Hold Time Validation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Validation Details</p>
              <p className="text-xs text-blue-700 mt-1">
                Equipment: {selectedValidation && getEquipmentName(selectedValidation.equipment_id)}<br />
                Type: {selectedValidation?.hold_type}<br />
                Validated Hours: {selectedValidation?.validated_hours}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="successful-runs">Number of Successful Runs</Label>
              <Input
                id="successful-runs"
                type="number"
                min={1}
                max={3}
                defaultValue={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validation-notes">Conclusions / Notes</Label>
              <textarea
                id="validation-notes"
                className="w-full p-2 border rounded-md min-h-[80px]"
                placeholder="Add any conclusions or notes..."
              />
            </div>
            <Button onClick={async () => {
              const runs = (document.getElementById('successful-runs') as HTMLInputElement)?.value
              await approveValidation.mutateAsync({
                id: selectedValidation?.id,
                successfulRuns: parseInt(runs) || 3,
              })
              setShowValidationDialog(false)
              refetchValidations()
            }}>
              Approve Validation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}