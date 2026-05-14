'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, Droplets } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step5_RinseLimit({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null)
  const [equipmentList, setEquipmentList] = useState<any[]>([])
  const [calculated, setCalculated] = useState(false)

  // Fetch equipment list on mount
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

    const selectedEquipment = equipmentList.find(e => e.id === selectedEquipmentId)
    if (!selectedEquipment) {
      toast.error('Selected equipment not found')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/calculations/rinse-limit', {
        session_id: data.sessionId,
        equipment_id: selectedEquipmentId,
        rinse_volume: 25, // Default rinse volume
        total_surface_area: data.totalSurfaceArea || 100
      })

      const rinseLimit = {
        limit_mg: response.data.limit_mg,
        limit_ppm: response.data.limit_ppm,
        volume_loq: response.data.volume_loq,
        volume_10ppm: response.data.volume_10ppm,
        volume_amv: response.data.volume_amv,
        maco_mg: response.data.maco_mg,
        equipment_name: selectedEquipment.name,
        equipment_surface_area: selectedEquipment.surface_area
      }

      onChange({ ...data, rinseLimit })
      setCalculated(true)
      toast.success('Rinse limit calculated successfully')
    } catch (error: any) {
      console.error('Rinse limit calculation failed:', error)
      toast.error(error.response?.data?.detail || 'Failed to calculate rinse limit')
    } finally {
      setLoading(false)
    }
  }

  // Auto-calculate when equipment is selected
  useEffect(() => {
    if (data.sessionId && selectedEquipmentId && !data.rinseLimit && !calculated) {
      calculateRinseLimit()
    }
  }, [selectedEquipmentId])

  // Get selected equipment details
  const selectedEquipment = equipmentList.find(e => e.id === selectedEquipmentId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Rinse Limit Calculation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equipment Selection */}
        <div className="space-y-2">
          <Label>Select Equipment for Rinse Limit *</Label>
          <Select
            value={selectedEquipmentId?.toString() || ''}
            onChange={(e) => setSelectedEquipmentId(parseInt(e.target.value))}
          >
            <option value="">Select equipment...</option>
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name} ({eq.equipment_id}) - {eq.surface_area} m²
              </option>
            ))}
          </Select>
          <p className="text-xs text-gray-500">
            Rinse limit is calculated per equipment based on its surface area
          </p>
        </div>

        {/* Results */}
        {data.rinseLimit ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-green-50 rounded-xl text-center border border-green-200">
                <Droplets className="h-8 w-8 text-pharma-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Rinse Limit</p>
                <p className="text-3xl font-bold text-pharma-700">{data.rinseLimit.limit_mg?.toFixed(4) || '0'} mg</p>
                <p className="text-xs text-gray-500 mt-2">(MACO × Eq Area) / Total Area</p>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-xl text-center border border-blue-200">
                <Droplets className="h-8 w-8 text-pharma-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Rinse Limit</p>
                <p className="text-3xl font-bold text-pharma-700">{data.rinseLimit.limit_ppm?.toFixed(2) || '0'} ppm</p>
                <p className="text-xs text-gray-500 mt-2">ppm = mg/L (based on rinse volume)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-xs text-gray-500">Volume (LOQ based)</p>
                <p className="text-lg font-bold text-purple-700">{data.rinseLimit.volume_loq?.toFixed(2) || '0'} L</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg text-center">
                <p className="text-xs text-gray-500">Volume (10 ppm based)</p>
                <p className="text-lg font-bold text-indigo-700">{data.rinseLimit.volume_10ppm?.toFixed(2) || '0'} L</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-lg text-center">
                <p className="text-xs text-gray-500">Volume (AMV based)</p>
                <p className="text-lg font-bold text-teal-700">{data.rinseLimit.volume_amv?.toFixed(2) || '0'} L</p>
              </div>
            </div>

            {selectedEquipment && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  <strong>Equipment:</strong> {selectedEquipment.name} ({selectedEquipment.surface_area} m²)
                </p>
                <p className="text-sm">
                  <strong>MACO Used:</strong> {data.rinseLimit.maco_mg?.toFixed(2) || '0'} mg
                </p>
              </div>
            )}

            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Acceptance Criteria:</strong> Rinse results must be below {data.rinseLimit.limit_ppm?.toFixed(2)} ppm
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Minimum rinse volume required: {data.rinseLimit.volume_loq?.toFixed(2)} L (to detect at LOQ)
              </p>
            </div>

            <Button 
              onClick={calculateRinseLimit} 
              disabled={loading} 
              variant="outline" 
              className="w-full"
            >
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
                <Button 
                  onClick={calculateRinseLimit} 
                  disabled={loading || !selectedEquipmentId}
                >
                  Calculate Rinse Limit
                </Button>
              </>
            )}
          </div>
        )}

        {!data.totalSurfaceArea && (
          <div className="p-3 bg-red-50 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">
              Total surface area not calculated. Please go back to Step 2 and select equipment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}