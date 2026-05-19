// src/components/wizard/Step5_RinseLimit.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, Droplets } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step5_RinseLimit({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null)
  const [equipmentList, setEquipmentList] = useState<any[]>([])
  const [rinseVolume, setRinseVolume] = useState(25)
  const [rinseData, setRinseData] = useState<any>(null)

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get('/equipment')
        setEquipmentList(res.data)
      } catch (error) {
        console.error('Failed to fetch equipment:', error)
      }
    }
    fetchEquipment()
  }, [])

  const calculateRinseLimit = async () => {
    if (!data.sessionId) {
      toast.error('Please create session first')
      return
    }

    if (!selectedEquipmentId) {
      toast.error('Please select equipment for rinse limit calculation')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/calculations/rinse-limit', {
        session_id: data.sessionId,
        equipment_id: selectedEquipmentId,
        rinse_volume: rinseVolume,
        total_surface_area: data.totalSurfaceArea || 100
      })

      const rinseLimit = {
        limit_mg: response.data.limit_mg || 0,
        limit_ppm: response.data.limit_ppm || 0,
        volume_loq: response.data.volume_loq || 0,
        volume_10ppm: response.data.volume_10ppm || 0,
        volume_amv: response.data.volume_amv || 0,
        formula: response.data.formula,
        reference: response.data.reference,
      }

      setRinseData(rinseLimit)
      onChange({ ...data, rinseLimit })
      toast.success('Rinse limit calculated successfully')
    } catch (error: any) {
      console.error('Rinse limit calculation failed:', error)
      toast.error(error.response?.data?.detail || 'Failed to calculate rinse limit')
    } finally {
      setLoading(false)
    }
  }

  const selectedEquipment = equipmentList.find(e => e.id === selectedEquipmentId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Step 5: Rinse Limit Calculation (APIC Section 4.2.5)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="equipment-select">Select Equipment for Rinse Limit *</Label>
          <select
            id="equipment-select"
            className="w-full p-2 border rounded-md"
            value={selectedEquipmentId || ''}
            onChange={(e) => setSelectedEquipmentId(parseInt(e.target.value))}
            aria-label="Select Equipment for Rinse Limit"
            title="Select Equipment for Rinse Limit"
          >
            <option value="">Select equipment...</option>
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name} ({eq.equipment_id}) - {eq.surface_area} m²
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Rinse limit is calculated per equipment based on its surface area
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rinse-volume">Rinse Volume (L)</Label>
          <Input
            id="rinse-volume"
            type="number"
            step="1"
            value={rinseVolume}
            onChange={(e) => setRinseVolume(parseFloat(e.target.value) || 0)}
          />
          <p className="text-xs text-gray-500">Actual rinse volume used for sampling</p>
        </div>

        {rinseData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-green-50 rounded-xl text-center border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Rinse Limit</p>
                <p className="text-3xl font-bold text-pharma-700">{rinseData.limit_mg?.toFixed(4)} mg</p>
                <p className="text-xs text-gray-500 mt-2">(MACO × Eq Area) / Total Area</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-xl text-center border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Rinse Limit</p>
                <p className="text-3xl font-bold text-pharma-700">{rinseData.limit_ppm?.toFixed(2)} ppm</p>
                <p className="text-xs text-gray-500 mt-2">ppm = mg/L (based on rinse volume)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-xs text-gray-500">Volume (LOQ based)</p>
                <p className="text-lg font-bold text-purple-700">{rinseData.volume_loq?.toFixed(2)} L</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg text-center">
                <p className="text-xs text-gray-500">Volume (10 ppm based)</p>
                <p className="text-lg font-bold text-indigo-700">{rinseData.volume_10ppm?.toFixed(2)} L</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-lg text-center">
                <p className="text-xs text-gray-500">Volume (AMV based)</p>
                <p className="text-lg font-bold text-teal-700">{rinseData.volume_amv?.toFixed(2)} L</p>
              </div>
            </div>

            {selectedEquipment && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  <strong>Equipment:</strong> {selectedEquipment.name} ({selectedEquipment.surface_area} m²)
                </p>
              </div>
            )}

            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">Acceptance Criteria</p>
              <p className="text-sm text-yellow-700 mt-1">
                Rinse results must be below <strong>{rinseData.limit_ppm?.toFixed(2)} ppm</strong>
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Minimum rinse volume required: {rinseData.volume_loq?.toFixed(2)} L (to detect at LOQ)
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium">Formula Reference</p>
              <p className="text-xs text-gray-600 mt-1">{rinseData.formula}</p>
              <p className="text-xs text-gray-500 mt-1">{rinseData.reference}</p>
            </div>

            <Button onClick={calculateRinseLimit} disabled={loading} variant="outline" className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Recalculate Rinse Limit
            </Button>
          </>
        ) : (
          <div className="text-center py-8">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-pharma-600" />
                <span>Calculating rinse limit...</span>
              </div>
            ) : (
              <>
                <p className="text-gray-500 mb-4">Select equipment to calculate rinse limit</p>
                <Button onClick={calculateRinseLimit} disabled={loading || !selectedEquipmentId}>
                  Calculate Rinse Limit
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}