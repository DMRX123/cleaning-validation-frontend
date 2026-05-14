// src/components/wizard/Step8_RinseResults.tsx - COMPLETE FIXED
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step8_RinseResults({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [results, setResults] = useState<any[]>(data.rinseResults || [])
  const [formData, setFormData] = useState({
    equipment_name: '',
    actual_rinse_volume: 25,
    absorbance_sample: 0,
    absorbance_std: 0.5,
  })
  const [loading, setLoading] = useState(false)

  const addResult = async () => {
    if (!formData.equipment_name || !data.sessionId) {
      toast.error('Please enter equipment name')
      return
    }
    
    setLoading(true)
    try {
      const res = await api.post('/validation/rinse-result', { 
        session_id: data.sessionId, 
        equipment_name: formData.equipment_name,
        actual_rinse_volume: formData.actual_rinse_volume,
        absorbance_sample: formData.absorbance_sample,
        absorbance_std: formData.absorbance_std
      })
      
      const newResults = [...results, { 
        equipment_name: formData.equipment_name, 
        result_ppm: res.data.result_ppm,
        reported: res.data.reported
      }]
      setResults(newResults)
      onChange({ ...data, rinseResults: newResults })
      setFormData({ equipment_name: '', actual_rinse_volume: 25, absorbance_sample: 0, absorbance_std: 0.5 })
      toast.success('Rinse result added')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Step 8: Rinse Results</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Equipment Name *</Label>
            <Input 
              placeholder="e.g., Reactor R-101" 
              value={formData.equipment_name} 
              onChange={(e) => setFormData({...formData, equipment_name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Rinse Volume (L)</Label>
            <Input 
              type="number" 
              step="1"
              value={formData.actual_rinse_volume} 
              onChange={(e) => setFormData({...formData, actual_rinse_volume: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div className="space-y-2">
            <Label>Sample Absorbance</Label>
            <Input 
              type="number" 
              step="0.01"
              placeholder="0.00" 
              value={formData.absorbance_sample} 
              onChange={(e) => setFormData({...formData, absorbance_sample: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div className="space-y-2">
            <Label>Standard Absorbance</Label>
            <Input 
              type="number" 
              step="0.01"
              placeholder="0.50" 
              value={formData.absorbance_std} 
              onChange={(e) => setFormData({...formData, absorbance_std: parseFloat(e.target.value) || 0.5})}
            />
          </div>
        </div>
        
        <Button onClick={addResult} disabled={loading} className="w-full">
          {loading ? 'Adding...' : 'Add Rinse Result'}
        </Button>
        
        {results.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Result (ppm)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.equipment_name}</TableCell>
                  <TableCell>{r.result_ppm?.toFixed(2) || '-'}</TableCell>
                  <TableCell>{r.reported || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}