// src/components/nitrosamine/NitrosamineAssessment.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Shield, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useProducts } from '@/hooks/useProducts'

interface NitrosamineData {
  id?: number
  product_id: number
  secondary_amine_present: boolean
  tertiary_amine_present: boolean
  primary_amine_present: boolean
  nitrite_in_raw_materials: boolean
  recovered_solvents_used: boolean
  nitrosating_agents_used: boolean
  low_ph_conditions: boolean
  high_temperature_used: boolean
  water_nitrite_level_ppm: number | null
  chloramines_in_water: boolean
  overall_risk_level: 'Low' | 'Medium' | 'High'
  risk_justification: string
  requires_confirmatory_testing: boolean
  mitigation_plan: string
  assessment_date: string
  assessed_by: string
}

export function NitrosamineAssessment({ productId: propProductId }: { productId?: number }) {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(propProductId || null)
  const [existingAssessment, setExistingAssessment] = useState<NitrosamineData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    secondary_amine_present: false,
    tertiary_amine_present: false,
    primary_amine_present: false,
    nitrite_in_raw_materials: false,
    recovered_solvents_used: false,
    nitrosating_agents_used: false,
    low_ph_conditions: false,
    high_temperature_used: false,
    water_nitrite_level_ppm: '',
    chloramines_in_water: false,
    risk_justification: '',
    mitigation_plan: '',
    assessed_by: '',
  })

  const { data: products } = useProducts()

  useEffect(() => {
    if (selectedProduct) {
      fetchAssessment()
    }
  }, [selectedProduct])

  const fetchAssessment = async () => {
    if (!selectedProduct) return
    setLoading(true)
    try {
      const res = await api.get(`/nitrosamine/${selectedProduct}`)
      if (res.data) {
        setExistingAssessment(res.data)
        setFormData({
          secondary_amine_present: res.data.secondary_amine_present,
          tertiary_amine_present: res.data.tertiary_amine_present,
          primary_amine_present: res.data.primary_amine_present,
          nitrite_in_raw_materials: res.data.nitrite_in_raw_materials,
          recovered_solvents_used: res.data.recovered_solvents_used || false,
          nitrosating_agents_used: res.data.nitrosating_agents_used,
          low_ph_conditions: res.data.low_ph_conditions || false,
          high_temperature_used: res.data.high_temperature_used || false,
          water_nitrite_level_ppm: res.data.water_nitrite_level_ppm?.toString() || '',
          chloramines_in_water: res.data.chloramines_in_water || false,
          risk_justification: res.data.risk_justification || '',
          mitigation_plan: res.data.mitigation_plan || '',
          assessed_by: res.data.assessed_by || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRiskLevel = (): { level: 'Low' | 'Medium' | 'High'; justification: string } => {
    let riskScore = 0
    const justifications: string[] = []

    if (formData.secondary_amine_present && formData.nitrosating_agents_used) {
      riskScore += 3
      justifications.push('Secondary amine + nitrosating agents present - HIGH risk of nitrosamine formation')
    } else if (formData.secondary_amine_present) {
      riskScore += 2
      justifications.push('Secondary amine present - potential risk')
    }
    
    if (formData.tertiary_amine_present) {
      riskScore += 1
      justifications.push('Tertiary amine present - low risk')
    }
    
    if (formData.nitrite_in_raw_materials) {
      riskScore += 2
      justifications.push('Nitrite in raw materials - potential nitrosating agent')
    }
    
    if (formData.low_ph_conditions) {
      riskScore += 1
      justifications.push('Low pH conditions - may promote nitrosamine formation')
    }
    
    if (formData.high_temperature_used) {
      riskScore += 1
      justifications.push('High temperature processing - may increase formation rate')
    }
    
    const waterNitrite = parseFloat(formData.water_nitrite_level_ppm || '0')
    if (waterNitrite > 0.1) {
      riskScore += 1
      justifications.push(`Water nitrite level ${formData.water_nitrite_level_ppm} ppm - above action limit`)
    }

    if (riskScore >= 4) {
      return { level: 'High', justification: justifications.join('; ') || 'Multiple risk factors identified' }
    } else if (riskScore >= 2) {
      return { level: 'Medium', justification: justifications.join('; ') || 'Moderate risk factors identified' }
    }
    return { level: 'Low', justification: justifications.join('; ') || 'No significant risk factors identified' }
  }

  const handleCheckboxChange = (field: keyof typeof formData, checked: boolean | string) => {
    setFormData({ ...formData, [field]: checked === true })
  }

  const handleSubmit = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }
    if (!formData.assessed_by) {
      toast.error('Please enter assessor name')
      return
    }

    const risk = calculateRiskLevel()
    
    setSaving(true)
    try {
      const payload = {
        product_id: selectedProduct,
        assessed_by: formData.assessed_by,
        secondary_amine_present: formData.secondary_amine_present,
        tertiary_amine_present: formData.tertiary_amine_present,
        primary_amine_present: formData.primary_amine_present,
        nitrite_in_raw_materials: formData.nitrite_in_raw_materials,
        recovered_solvents_used: formData.recovered_solvents_used,
        nitrosating_agents_used: formData.nitrosating_agents_used,
        low_ph_conditions: formData.low_ph_conditions,
        high_temperature_used: formData.high_temperature_used,
        water_nitrite_level_ppm: formData.water_nitrite_level_ppm ? parseFloat(formData.water_nitrite_level_ppm) : null,
        chloramines_in_water: formData.chloramines_in_water,
        overall_risk_level: risk.level,
        risk_justification: risk.justification,
        requires_confirmatory_testing: risk.level === 'High',
        mitigation_plan: formData.mitigation_plan,
      }

      if (existingAssessment?.id) {
        await api.put(`/nitrosamine/${existingAssessment.id}`, payload)
        toast.success('Nitrosamine risk assessment updated')
      } else {
        await api.post('/nitrosamine', payload)
        toast.success('Nitrosamine risk assessment completed')
      }
      
      fetchAssessment()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save assessment')
    } finally {
      setSaving(false)
    }
  }

  const risk = selectedProduct ? calculateRiskLevel() : { level: 'Low' as const, justification: '' }
  const riskColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-pharma-600" />
          Nitrosamine Risk Assessment (Section 13)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Selection */}
        {!propProductId && (
          <div className="space-y-2">
            <Label htmlFor="product-select">Select Product</Label>
            <select
              id="product-select"
              className="w-full p-2 border rounded-md"
              value={selectedProduct || ''}
              onChange={(e) => setSelectedProduct(parseInt(e.target.value) || null)}
              aria-label="Select Product"
              title="Select Product"
            >
              <option value="">Select a product...</option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
          </div>
        )}

        {selectedProduct && !loading && (
          <>
            {/* Risk Level Display */}
            <div className={`p-4 rounded-lg flex items-start gap-3 ${riskColors[risk.level]}`}>
              {risk.level === 'High' ? (
                <AlertCircle className="h-5 w-5 mt-0.5" />
              ) : risk.level === 'Medium' ? (
                <AlertCircle className="h-5 w-5 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 mt-0.5" />
              )}
              <div>
                <p className="font-medium">Overall Risk Level: {risk.level}</p>
                <p className="text-sm mt-1">{risk.justification || 'No risk factors identified'}</p>
              </div>
            </div>

            {/* Raw Materials Assessment */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Raw Materials Assessment</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.secondary_amine_present}
                    onChange={(e) => handleCheckboxChange('secondary_amine_present', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                  />
                  <span className="text-sm">Secondary amines present in raw materials</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tertiary_amine_present}
                    onChange={(e) => handleCheckboxChange('tertiary_amine_present', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                  />
                  <span className="text-sm">Tertiary amines present</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.primary_amine_present}
                    onChange={(e) => handleCheckboxChange('primary_amine_present', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                  />
                  <span className="text-sm">Primary amines present</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.nitrite_in_raw_materials}
                    onChange={(e) => handleCheckboxChange('nitrite_in_raw_materials', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                  />
                  <span className="text-sm">Nitrite/nitrate in raw materials</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.recovered_solvents_used}
                    onChange={(e) => handleCheckboxChange('recovered_solvents_used', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                  />
                  <span className="text-sm">Recovered solvents used in process</span>
                </label>
              </div>
            </div>

            {/* Process Conditions */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Process Conditions</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.nitrosating_agents_used}
                    onChange={(e) => handleCheckboxChange('nitrosating_agents_used', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                  />
                  <span className="text-sm">Nitrosating agents used (e.g., nitrite, nitrous acid)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.low_ph_conditions}
                    onChange={(e) => handleCheckboxChange('low_ph_conditions', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                  />
                  <span className="text-sm">Low pH conditions (pH &lt; 7) during processing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.high_temperature_used}
                    onChange={(e) => handleCheckboxChange('high_temperature_used', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                  />
                  <span className="text-sm">High temperature processing (&gt; 100°C)</span>
                </label>
              </div>
            </div>

            {/* Water System */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Water System Assessment</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="water-nitrite">Water Nitrite Level (ppm)</Label>
                  <Input
                    id="water-nitrite"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 0.05"
                    value={formData.water_nitrite_level_ppm}
                    onChange={(e) => setFormData({ ...formData, water_nitrite_level_ppm: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Action limit: 0.1 ppm</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.chloramines_in_water}
                    onChange={(e) => handleCheckboxChange('chloramines_in_water', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-pharma-600 focus:ring-pharma-500"
                  />
                  <span className="text-sm">Chloramines present in water system</span>
                </label>
              </div>
            </div>

            {/* Mitigation Plan */}
            <div className="space-y-2">
              <Label htmlFor="mitigation-plan">Mitigation / Control Plan</Label>
              <textarea
                id="mitigation-plan"
                className="w-full p-2 border rounded-md min-h-[100px]"
                placeholder="Describe controls to prevent nitrosamine formation..."
                value={formData.mitigation_plan}
                onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessed-by">Assessed By *</Label>
              <Input
                id="assessed-by"
                placeholder="Assessor name"
                value={formData.assessed_by}
                onChange={(e) => setFormData({ ...formData, assessed_by: e.target.value })}
              />
            </div>

            <Button onClick={handleSubmit} disabled={saving} className="w-full">
              {saving ? 'Saving...' : (existingAssessment ? 'Update Assessment' : 'Submit Assessment')}
            </Button>

            {/* Reference Note */}
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-medium text-blue-800">EMA/CHMP/428592/2019 - Nitrosamines in Human Medicines</p>
              <p className="text-xs text-blue-600 mt-1">
                High risk products require confirmatory testing using validated GC-MS/MS or LC-MS/MS methods.
                Control strategy must include root cause analysis and appropriate mitigation measures.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}