// src/components/wizard/Step6_Standards.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, FlaskConical } from 'lucide-react'
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
  const [saved, setSaved] = useState(false)

  const handleSubmit = async () => {
    if (!data.sessionId) {
      toast.error('No active session')
      return
    }
    
    setLoading(true)
    try {
      const res = await api.post('/validation/standard-prep', { 
        session_id: data.sessionId, 
        ...formData 
      })
      onChange({ ...data, standardPrep: res.data })
      setSaved(true)
      toast.success('Standard preparation saved')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  // Calculate dilution factor preview
  const calculateDilutionFactor = () => {
    if (formData.first_dilution <= 0) return 0
    let factor = formData.wt_of_std / formData.first_dilution
    factor = factor * (formData.potency / 100)
    return factor.toFixed(6)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          Step 6: Standard Preparation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Weight of Standard (mg) *</Label>
            <Input 
              type="number" 
              step="0.1"
              value={formData.wt_of_std} 
              onChange={(e) => setFormData({...formData, wt_of_std: parseFloat(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <Label>Potency (%) *</Label>
            <Input 
              type="number" 
              step="0.1"
              value={formData.potency} 
              onChange={(e) => setFormData({...formData, potency: parseFloat(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <Label>First Dilution (ml)</Label>
            <Input type="number" value={formData.first_dilution} onChange={(e) => setFormData({...formData, first_dilution: parseFloat(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>Second Dilution (ml)</Label>
            <Input type="number" value={formData.second_dilution} onChange={(e) => setFormData({...formData, second_dilution: parseFloat(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>Third Dilution (ml)</Label>
            <Input type="number" value={formData.third_dilution} onChange={(e) => setFormData({...formData, third_dilution: parseFloat(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>Fourth Dilution (ml)</Label>
            <Input type="number" value={formData.fourth_dilution} onChange={(e) => setFormData({...formData, fourth_dilution: parseFloat(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>Fifth Dilution (ml)</Label>
            <Input type="number" value={formData.fifth_dilution} onChange={(e) => setFormData({...formData, fifth_dilution: parseFloat(e.target.value)})} />
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Dilution Factor Preview</p>
          <p className="text-lg font-mono text-blue-700">{calculateDilutionFactor()}</p>
          <p className="text-xs text-blue-600 mt-1">Formula: (Wt × Potency%) / First Dilution</p>
        </div>
        
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {saved ? 'Update Standard Preparation' : 'Save Standard Preparation'}
        </Button>

        {saved && (
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-800">✓ Standard preparation saved successfully</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}