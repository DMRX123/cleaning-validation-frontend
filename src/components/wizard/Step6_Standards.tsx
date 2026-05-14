'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Step6_Standards({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    wt_of_std: 50,
    first_dilution: 100,
    second_dilution: 100,
    third_dilution: 100,
    fourth_dilution: 100,
    fifth_dilution: 100,
    potency: 100,
  })

  const handleSubmit = async () => {
    if (!data.sessionId) return
    setLoading(true)
    try {
      const res = await api.post('/validation/standard-prep', { session_id: data.sessionId, ...formData })
      onChange({ ...data, standardPrep: res.data })
      toast.success('Standard preparation saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 6: Standard Preparation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Weight of Standard (mg)</Label><Input type="number" value={formData.wt_of_std} onChange={(e) => setFormData({...formData, wt_of_std: parseFloat(e.target.value)})} /></div>
          <div><Label>Potency (%)</Label><Input type="number" value={formData.potency} onChange={(e) => setFormData({...formData, potency: parseFloat(e.target.value)})} /></div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="mt-4 w-full">{loading ? 'Saving...' : 'Save Standard Preparation'}</Button>
      </CardContent>
    </Card>
  )
}
