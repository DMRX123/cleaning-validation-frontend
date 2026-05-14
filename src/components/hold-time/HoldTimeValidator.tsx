'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import api from '@/lib/api'

interface HoldTimeValidatorProps {
  equipmentId: number
}

export function HoldTimeValidator({ equipmentId }: HoldTimeValidatorProps) {
  const [dhtResult, setDhtResult] = useState<any>(null)
  const [chtResult, setChtResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [dhtData, setDhtData] = useState({
    end_of_batch_time: '',
    cleaning_start_time: '',
    max_dht_hours: 24
  })
  const [chtData, setChtData] = useState({
    cleaning_completion_time: '',
    next_use_time: '',
    max_cht_hours: 72,
    storage_conditions: 'Covered, dry, room temperature'
  })

  const validateDHT = async () => {
    if (!dhtData.end_of_batch_time || !dhtData.cleaning_start_time) {
      alert('Please enter both times')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/cleaning-validation/validate-dirty-hold-time', {
        equipment_id: equipmentId,
        product_name: 'Current Product',
        end_of_batch_time: dhtData.end_of_batch_time,
        cleaning_start_time: dhtData.cleaning_start_time,
        max_dht_hours: dhtData.max_dht_hours
      })
      setDhtResult(res.data)
    } catch (error) {
      console.error('DHT validation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateCHT = async () => {
    if (!chtData.cleaning_completion_time || !chtData.next_use_time) {
      alert('Please enter both times')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/cleaning-validation/validate-clean-hold-time', {
        equipment_id: equipmentId,
        cleaning_completion_time: chtData.cleaning_completion_time,
        next_use_time: chtData.next_use_time,
        max_cht_hours: chtData.max_cht_hours,
        storage_conditions: chtData.storage_conditions
      })
      setChtResult(res.data)
    } catch (error) {
      console.error('CHT validation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Hold Time Validation (Section 9.7)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Dirty Hold Time Section */}
          <div className="border-b pb-4">
            <h3 className="font-medium mb-4">Dirty Hold Time (DHT)</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>End of Batch Time</Label>
                <Input
                  type="datetime-local"
                  value={dhtData.end_of_batch_time}
                  onChange={(e) => setDhtData({ ...dhtData, end_of_batch_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cleaning Start Time</Label>
                <Input
                  type="datetime-local"
                  value={dhtData.cleaning_start_time}
                  onChange={(e) => setDhtData({ ...dhtData, cleaning_start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Validated DHT (hours)</Label>
                <Input
                  type="number"
                  value={dhtData.max_dht_hours}
                  onChange={(e) => setDhtData({ ...dhtData, max_dht_hours: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <Button onClick={validateDHT} disabled={loading}>Validate DHT</Button>

            {dhtResult && (
              <div className={`mt-4 p-3 rounded-lg ${dhtResult.is_within_limit ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2">
                  {dhtResult.is_within_limit ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">Status: {dhtResult.status}</span>
                  <Badge variant={dhtResult.is_within_limit ? 'success' : 'destructive'}>
                    {dhtResult.is_within_limit ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
                <p className="text-sm mt-2">Actual DHT: {dhtResult.actual_dht_hours} hours</p>
                <p className="text-sm">Limit: {dhtResult.max_validated_dht_hours} hours</p>
                {!dhtResult.is_within_limit && dhtResult.action_required && (
                  <p className="text-sm text-red-600 mt-2">{dhtResult.action_required}</p>
                )}
              </div>
            )}
          </div>

          {/* Clean Hold Time Section */}
          <div>
            <h3 className="font-medium mb-4">Clean Hold Time (CHT)</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Cleaning Completion Time</Label>
                <Input
                  type="datetime-local"
                  value={chtData.cleaning_completion_time}
                  onChange={(e) => setChtData({ ...chtData, cleaning_completion_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Next Use Time</Label>
                <Input
                  type="datetime-local"
                  value={chtData.next_use_time}
                  onChange={(e) => setChtData({ ...chtData, next_use_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Validated CHT (hours)</Label>
                <Input
                  type="number"
                  value={chtData.max_cht_hours}
                  onChange={(e) => setChtData({ ...chtData, max_cht_hours: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Storage Conditions</Label>
                <Input
                  value={chtData.storage_conditions}
                  onChange={(e) => setChtData({ ...chtData, storage_conditions: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={validateCHT} disabled={loading}>Validate CHT</Button>

            {chtResult && (
              <div className={`mt-4 p-3 rounded-lg ${chtResult.is_within_limit ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2">
                  {chtResult.is_within_limit ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">Status: {chtResult.status}</span>
                  <Badge variant={chtResult.is_within_limit ? 'success' : 'destructive'}>
                    {chtResult.is_within_limit ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
                <p className="text-sm mt-2">Actual CHT: {chtResult.actual_cht_hours} hours</p>
                <p className="text-sm">Limit: {chtResult.max_validated_cht_hours} hours</p>
                <p className="text-sm">Storage: {chtResult.storage_conditions}</p>
                {!chtResult.is_within_limit && chtResult.action_required && (
                  <p className="text-sm text-red-600 mt-2">{chtResult.action_required}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}