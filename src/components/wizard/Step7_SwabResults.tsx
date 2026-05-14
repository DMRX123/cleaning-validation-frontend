'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step7_SwabResults({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [results, setResults] = useState<any[]>(data.swabResults || [])
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)

  const addResult = async () => {
    if (!location || !data.sessionId) return
    setLoading(true)
    try {
      const res = await api.post('/validation/swab-result', { session_id: data.sessionId, location_name: location, absorbance_sample: 0.1, absorbance_std: 0.5 })
      const newResults = [...results, { location_name: location, result_ppm: res.data.result_ppm }]
      setResults(newResults)
      onChange({ ...data, swabResults: newResults })
      setLocation('')
      toast.success('Swab result added')
    } catch { toast.error('Failed to add') } finally { setLoading(false) }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Step 7: Swab Results</CardTitle></CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Input placeholder="Location name" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Button onClick={addResult} disabled={loading}>Add</Button>
        </div>
        {results.length > 0 && (
          <Table>
            <TableHeader><TableRow><TableHead>Location</TableHead><TableHead>Result (ppm)</TableHead></TableRow></TableHeader>
            <TableBody>{results.map((r, i) => (<TableRow key={i}><TableCell>{r.location_name}</TableCell><TableCell>{r.result_ppm?.toFixed(2)}</TableCell></TableRow>))}</TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
