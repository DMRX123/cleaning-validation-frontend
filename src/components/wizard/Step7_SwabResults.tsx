// src/components/wizard/Step7_SwabResults.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step7_SwabResults({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [results, setResults] = useState<any[]>(data.swabResults || [])
  const [formData, setFormData] = useState({
    location_name: '',
    absorbance_sample: 0,
    absorbance_std: 0.5,
  })
  const [loading, setLoading] = useState(false)

  const addResult = async () => {
    if (!formData.location_name || !data.sessionId) {
      toast.error('Please enter location name')
      return
    }
    
    setLoading(true)
    try {
      const res = await api.post('/validation/swab-result', { 
        session_id: data.sessionId, 
        location_name: formData.location_name,
        absorbance_sample: formData.absorbance_sample,
        absorbance_std: formData.absorbance_std
      })
      
      const newResults = [...results, { 
        id: res.data.id,
        location_name: formData.location_name, 
        result_ppm: res.data.result_ppm,
        reported: res.data.reported,
        below_loq: res.data.below_loq
      }]
      setResults(newResults)
      onChange({ ...data, swabResults: newResults })
      setFormData({ location_name: '', absorbance_sample: 0, absorbance_std: 0.5 })
      toast.success('Swab result added')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  const deleteResult = async (id: number) => {
    try {
      await api.delete(`/validation/swab-result/${id}`)
      const newResults = results.filter(r => r.id !== id)
      setResults(newResults)
      onChange({ ...data, swabResults: newResults })
      toast.success('Swab result deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const getStatusBadge = (result: any) => {
    if (result.below_loq) return <Badge variant="outline">Below LOQ</Badge>
    if (data.swabLimit && result.result_ppm <= data.swabLimit.ppm) {
      return <Badge className="bg-green-100 text-green-800">PASS</Badge>
    }
    return <Badge className="bg-red-100 text-red-800">FAIL</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 7: Swab Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Location Name *</Label>
            <Input 
              placeholder="e.g., Manhole area" 
              value={formData.location_name} 
              onChange={(e) => setFormData({...formData, location_name: e.target.value})}
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Add Swab Result
        </Button>
        
        {results.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Result (ppm)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, i) => (
                  <TableRow key={r.id || i}>
                    <TableCell>{r.location_name}</TableCell>
                    <TableCell>{r.result_ppm?.toFixed(2) || (r.below_loq ? '< LOQ' : '-')}</TableCell>
                    <TableCell>{getStatusBadge(r)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => deleteResult(r.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}