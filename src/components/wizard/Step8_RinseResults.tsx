'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step8_RinseResults({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [results, setResults] = useState<any[]>(data.rinseResults || [])
  const [equipment, setEquipment] = useState('')
  const [loading, setLoading] = useState(false)

  const addResult = async () => {
    if (!equipment || !data.sessionId) return
    setLoading(true)
    try {
      const res = await api.post('/validation/rinse-result', { session_id: data.sessionId, equipment_name: equipment, actual_rinse_volume: 25, absorbance_sample: 0.1, absorbance_std: 0.5 })
      const newResults = [...results, { equipment_name: equipment, result_ppm: res.data.result_ppm }]
      setResults(newResults)
      onChange({ ...data, rinseResults: newResults })
      setEquipment('')
      toast.success('Rinse result added')
    } catch { toast.error('Failed to add') } finally { setLoading(false) }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Step 8: Rinse Results</CardTitle></CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Input placeholder="Equipment name" value={equipment} onChange={(e) => setEquipment(e.target.value)} />
          <Button onClick={addResult} disabled={loading}>Add</Button>
        </div>
        {results.length > 0 && (
          <Table>
            <TableHeader><TableRow><TableHead>Equipment</TableHead><TableHead>Result (ppm)</TableHead></TableRow></TableHeader>
            <TableBody>{results.map((r, i) => (<TableRow key={i}><TableCell>{r.equipment_name}</TableCell><TableCell>{r.result_ppm?.toFixed(2)}</TableCell></TableRow>))}</TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
