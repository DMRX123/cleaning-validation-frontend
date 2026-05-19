// src/app/(dashboard)/ade-calculator/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import toast from 'react-hot-toast'

// ============================================
// ACCURATE ADE/PDE CALCULATIONS
// Based on APIC Cleaning Validation Guide 2021 Section 4.2.1.1
// ============================================

const calculateADEFromNOAEL = (
  noael: number,
  bodyWeight: number = 50,
  uf1: number = 1,
  uf2: number = 10,
  uf3: number = 10,
  uf4: number = 1,
  uf5: number = 1
): number => {
  const totalUF = uf1 * uf2 * uf3 * uf4 * uf5
  if (totalUF <= 0) return 0
  const adeMgPerDay = (noael * bodyWeight) / totalUF
  return adeMgPerDay
}

const calculateADEFromLOAEL = (
  loael: number,
  bodyWeight: number = 50,
  uf1: number = 1,
  uf2: number = 10,
  uf3: number = 10,
  uf4: number = 1,
  uf5: number = 1,
  ufLoael: number = 3
): number => {
  const totalUF = uf1 * uf2 * uf3 * uf4 * uf5 * ufLoael
  if (totalUF <= 0) return 0
  const adeMgPerDay = (loael * bodyWeight) / totalUF
  return adeMgPerDay
}

const calculateADEFromLD50 = (
  ld50: number,
  bodyWeight: number = 50,
  safetyFactor: number = 2000
): number => {
  if (safetyFactor <= 0) return 0
  return (ld50 * bodyWeight) / safetyFactor
}

const getTTCValue = (category: 'carcinogenic' | 'potent' | 'standard'): number => {
  const ttcValues = {
    carcinogenic: 0.001,
    potent: 0.010,
    standard: 0.100
  }
  return ttcValues[category]
}

export default function ADECalculatorPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('noael')
  const [ttcCategory, setTtcCategory] = useState<'carcinogenic' | 'potent' | 'standard'>('standard')
  const [formData, setFormData] = useState({
    product_id: '',
    noael_mg_per_kg: '',
    loael_mg_per_kg: '',
    ld50_mg_per_kg: '',
    body_weight_kg: 50,
    uf1: 1,
    uf2: 10,
    uf3: 10,
    uf4: 1,
    uf5: 1,
    uf_loael: 3,
    route: 'oral'
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products')
        setProducts(res.data)
      } catch (error) {
        toast.error('Failed to fetch products')
      }
    }
    fetchProducts()
  }, [])

  const calculateADE = async () => {
    if (!formData.product_id) {
      toast.error('Please select a product')
      return
    }

    setLoading(true)
    
    try {
      // Client-side calculation (backend not available)
      let adeValue: number | null = null
      let method = ''
      let justification = ''
      let details = ''
      
      // Use activeTab to determine which method to use
      if (activeTab === 'noael' && formData.noael_mg_per_kg && parseFloat(formData.noael_mg_per_kg) > 0) {
        const noael = parseFloat(formData.noael_mg_per_kg)
        adeValue = calculateADEFromNOAEL(
          noael,
          formData.body_weight_kg,
          formData.uf1, formData.uf2, formData.uf3, formData.uf4, formData.uf5
        )
        method = 'NOAEL'
        const totalUF = formData.uf1 * formData.uf2 * formData.uf3 * formData.uf4 * formData.uf5
        justification = `Calculated using NOAEL = ${noael} mg/kg/day`
        details = `ADE = (${noael} × ${formData.body_weight_kg}) / (${formData.uf1} × ${formData.uf2} × ${formData.uf3} × ${formData.uf4} × ${formData.uf5}) = ${adeValue.toFixed(6)} mg/day`
      } 
      else if (activeTab === 'loael' && formData.loael_mg_per_kg && parseFloat(formData.loael_mg_per_kg) > 0) {
        const loael = parseFloat(formData.loael_mg_per_kg)
        adeValue = calculateADEFromLOAEL(
          loael,
          formData.body_weight_kg,
          formData.uf1, formData.uf2, formData.uf3, formData.uf4, formData.uf5,
          formData.uf_loael
        )
        method = 'LOAEL'
        justification = `Calculated using LOAEL = ${loael} mg/kg/day (with additional factor ${formData.uf_loael})`
        const totalUF = formData.uf1 * formData.uf2 * formData.uf3 * formData.uf4 * formData.uf5 * formData.uf_loael
        details = `ADE = (${loael} × ${formData.body_weight_kg}) / (${totalUF}) = ${adeValue.toFixed(6)} mg/day`
      } 
      else if (activeTab === 'ld50' && formData.ld50_mg_per_kg && parseFloat(formData.ld50_mg_per_kg) > 0) {
        const ld50 = parseFloat(formData.ld50_mg_per_kg)
        adeValue = calculateADEFromLD50(ld50, formData.body_weight_kg)
        method = 'LD50'
        justification = `Calculated using LD50 = ${ld50} mg/kg with standard safety factor 2000`
        details = `ADE = (${ld50} × ${formData.body_weight_kg}) / 2000 = ${adeValue.toFixed(6)} mg/day`
      } 
      else if (activeTab === 'ttc') {
        adeValue = getTTCValue(ttcCategory)
        method = `TTC (${ttcCategory})`
        justification = `Using TTC ${ttcCategory} value`
        details = `TTC ${ttcCategory} = ${adeValue.toFixed(6)} mg/day (${(adeValue * 1000).toFixed(2)} µg/day)`
      }
      else {
        toast.error(`Please enter valid data for ${activeTab.toUpperCase()} method`)
        setLoading(false)
        return
      }
      
      // Apply route-specific adjustment
      let routeAdjustment = ''
      if (formData.route === 'parenteral') {
        const originalValue = adeValue
        adeValue = adeValue / 10
        routeAdjustment = `Parenteral route: Reduced by factor 10 (${originalValue.toFixed(6)} → ${adeValue.toFixed(6)} mg/day)`
      } else if (formData.route === 'topical') {
        const originalValue = adeValue
        adeValue = adeValue / 2
        routeAdjustment = `Topical route: Reduced by factor 2 (${originalValue.toFixed(6)} → ${adeValue.toFixed(6)} mg/day)`
      }
      
      setResult({
        calculated_ade_mg_per_day: adeValue,
        calculated_ade_ug_per_day: adeValue * 1000,
        calculation_method: method,
        calculation_justification: justification,
        calculation_details: details,
        route_adjustment: routeAdjustment,
        uncertainty_factors: {
          UF1: formData.uf1,
          UF2: formData.uf2,
          UF3: formData.uf3,
          UF4: formData.uf4,
          UF5: formData.uf5,
          total: formData.uf1 * formData.uf2 * formData.uf3 * formData.uf4 * formData.uf5
        },
        reference: 'APIC Cleaning Validation Guide 2021 Section 4.2.1.1'
      })
      toast.success('ADE/PDE calculated successfully')
    } catch (error) {
      console.error('Calculation failed:', error)
      toast.error('Failed to calculate ADE/PDE')
    } finally {
      setLoading(false)
    }
  }

  const getMethodDescription = () => {
    switch(activeTab) {
      case 'noael':
        return 'NOAEL = No Observed Adverse Effect Level. The highest dose that does not cause adverse effects.'
      case 'loael':
        return 'LOAEL = Lowest Observed Adverse Effect Level. The lowest dose that causes adverse effects.'
      case 'ld50':
        return 'LD50 = Lethal Dose 50%. The dose required to kill half the test population.'
      case 'ttc':
        return 'TTC = Threshold of Toxicological Concern. Used when no toxicology data is available.'
      default:
        return ''
    }
  }

  // Check if current method has required data
  const isMethodDataValid = () => {
    if (activeTab === 'noael') {
      return formData.noael_mg_per_kg && parseFloat(formData.noael_mg_per_kg) > 0
    }
    if (activeTab === 'loael') {
      return formData.loael_mg_per_kg && parseFloat(formData.loael_mg_per_kg) > 0
    }
    if (activeTab === 'ld50') {
      return formData.ld50_mg_per_kg && parseFloat(formData.ld50_mg_per_kg) > 0
    }
    return true // TTC always valid
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="h-8 w-8 text-pharma-600" />
              <h1 className="text-2xl font-bold text-pharma-700">ADE/PDE Calculator</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Acceptable Daily Exposure / Permitted Daily Exposure</CardTitle>
                <p className="text-sm text-gray-500">APIC Section 4.2.1.1 - Health-Based Exposure Limits (HBEL)</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Selection */}
                <div className="space-y-2">
                  <Label htmlFor="product-select">Select Product *</Label>
                  <select
                    id="product-select"
                    className="w-full p-2 border rounded-md"
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    aria-label="Select Product"
                    title="Select Product"
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (Current ADE: {p.ade_pde} µg/day)</option>
                    ))}
                  </select>
                </div>

                {/* Method Tabs - FIXED: Added value prop to Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="flex flex-wrap h-auto mb-4">
                    <TabsTrigger value="noael">NOAEL Method</TabsTrigger>
                    <TabsTrigger value="loael">LOAEL Method</TabsTrigger>
                    <TabsTrigger value="ld50">LD50 Method</TabsTrigger>
                    <TabsTrigger value="ttc">TTC Method</TabsTrigger>
                  </TabsList>

                  <p className="text-xs text-gray-500 mb-4">{getMethodDescription()}</p>

                  {/* NOAEL Tab */}
                  <TabsContent value="noael" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="noael-value">NOAEL (mg/kg/day) *</Label>
                        <Input
                          id="noael-value"
                          type="number"
                          step="0.1"
                          value={formData.noael_mg_per_kg}
                          onChange={(e) => setFormData({ ...formData, noael_mg_per_kg: e.target.value })}
                          placeholder="e.g., 100"
                        />
                        <p className="text-xs text-gray-400">Required for NOAEL method</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="body-weight">Body Weight (kg)</Label>
                        <Input
                          id="body-weight"
                          type="number"
                          step="1"
                          value={formData.body_weight_kg}
                          onChange={(e) => setFormData({ ...formData, body_weight_kg: parseFloat(e.target.value) })}
                        />
                        <p className="text-xs text-gray-400">Standard: 50 kg (EMA/WHO)</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* LOAEL Tab */}
                  <TabsContent value="loael" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="loael-value">LOAEL (mg/kg/day) *</Label>
                        <Input
                          id="loael-value"
                          type="number"
                          step="0.1"
                          value={formData.loael_mg_per_kg}
                          onChange={(e) => setFormData({ ...formData, loael_mg_per_kg: e.target.value })}
                          placeholder="e.g., 50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uf-loael">LOAEL Factor (UF6)</Label>
                        <Input
                          id="uf-loael"
                          type="number"
                          step="1"
                          value={formData.uf_loael}
                          onChange={(e) => setFormData({ ...formData, uf_loael: parseFloat(e.target.value) })}
                        />
                        <p className="text-xs text-gray-400">Default: 3 (for LOAEL to NOAEL)</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* LD50 Tab */}
                  <TabsContent value="ld50" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ld50-value">LD50 (mg/kg) *</Label>
                        <Input
                          id="ld50-value"
                          type="number"
                          step="1"
                          value={formData.ld50_mg_per_kg}
                          onChange={(e) => setFormData({ ...formData, ld50_mg_per_kg: e.target.value })}
                          placeholder="e.g., 500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="body-weight-ld50">Body Weight (kg)</Label>
                        <Input
                          id="body-weight-ld50"
                          type="number"
                          step="1"
                          value={formData.body_weight_kg}
                          onChange={(e) => setFormData({ ...formData, body_weight_kg: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* TTC Tab */}
                  <TabsContent value="ttc" className="space-y-4">
                    <div className="space-y-2">
                      <Label>TTC Category</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          className={`p-3 rounded-lg text-center transition-all ${
                            ttcCategory === 'carcinogenic' 
                              ? 'bg-red-100 border-2 border-red-500 text-red-700' 
                              : 'bg-gray-100 border border-gray-200 text-gray-600'
                          }`}
                          onClick={() => setTtcCategory('carcinogenic')}
                        >
                          <div className="font-bold">Carcinogenic</div>
                          <div className="text-xs">1 µg/day</div>
                        </button>
                        <button
                          type="button"
                          className={`p-3 rounded-lg text-center transition-all ${
                            ttcCategory === 'potent' 
                              ? 'bg-yellow-100 border-2 border-yellow-500 text-yellow-700' 
                              : 'bg-gray-100 border border-gray-200 text-gray-600'
                          }`}
                          onClick={() => setTtcCategory('potent')}
                        >
                          <div className="font-bold">Potent</div>
                          <div className="text-xs">10 µg/day</div>
                        </button>
                        <button
                          type="button"
                          className={`p-3 rounded-lg text-center transition-all ${
                            ttcCategory === 'standard' 
                              ? 'bg-green-100 border-2 border-green-500 text-green-700' 
                              : 'bg-gray-100 border border-gray-200 text-gray-600'
                          }`}
                          onClick={() => setTtcCategory('standard')}
                        >
                          <div className="font-bold">Standard</div>
                          <div className="text-xs">100 µg/day</div>
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Uncertainty Factors */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Uncertainty Factors (F1-F5)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="uf1-value">F1 (Interspecies)</Label>
                      <Input 
                        id="uf1-value" 
                        type="number" 
                        step="1" 
                        min="1" 
                        max="12"
                        value={formData.uf1} 
                        onChange={(e) => setFormData({ ...formData, uf1: parseFloat(e.target.value) || 1 })} 
                      />
                      <p className="text-xs text-gray-400">Default: 1</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="uf2-value">F2 (Individual)</Label>
                      <Input 
                        id="uf2-value" 
                        type="number" 
                        step="1" 
                        min="1" 
                        max="10"
                        value={formData.uf2} 
                        onChange={(e) => setFormData({ ...formData, uf2: parseFloat(e.target.value) || 10 })} 
                      />
                      <p className="text-xs text-gray-400">Default: 10</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="uf3-value">F3 (Duration)</Label>
                      <Input 
                        id="uf3-value" 
                        type="number" 
                        step="1" 
                        min="1" 
                        max="10"
                        value={formData.uf3} 
                        onChange={(e) => setFormData({ ...formData, uf3: parseFloat(e.target.value) || 10 })} 
                      />
                      <p className="text-xs text-gray-400">Default: 10</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="uf4-value">F4 (Severity)</Label>
                      <Input 
                        id="uf4-value" 
                        type="number" 
                        step="1" 
                        min="1" 
                        max="10"
                        value={formData.uf4} 
                        onChange={(e) => setFormData({ ...formData, uf4: parseFloat(e.target.value) || 1 })} 
                      />
                      <p className="text-xs text-gray-400">Default: 1</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="uf5-value">F5 (Database)</Label>
                      <Input 
                        id="uf5-value" 
                        type="number" 
                        step="1" 
                        min="1" 
                        max="10"
                        value={formData.uf5} 
                        onChange={(e) => setFormData({ ...formData, uf5: parseFloat(e.target.value) || 1 })} 
                      />
                      <p className="text-xs text-gray-400">Default: 1</p>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <strong>Total UF:</strong> {formData.uf1} × {formData.uf2} × {formData.uf3} × {formData.uf4} × {formData.uf5} = {formData.uf1 * formData.uf2 * formData.uf3 * formData.uf4 * formData.uf5}
                  </div>
                </div>

                {/* Route Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="route-select">Route of Administration</Label>
                    <select
                      id="route-select"
                      className="w-full p-2 border rounded-md"
                      value={formData.route}
                      onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                      aria-label="Route of Administration"
                      title="Route of Administration"
                    >
                      <option value="oral">Oral</option>
                      <option value="parenteral">Parenteral (injectable)</option>
                      <option value="topical">Topical (cream/ointment)</option>
                    </select>
                    <p className="text-xs text-gray-400">
                      {formData.route === 'parenteral' && 'Parenteral route: 10x stricter limit'}
                      {formData.route === 'topical' && 'Topical route: 2x stricter limit'}
                      {formData.route === 'oral' && 'Oral route: Standard limit'}
                    </p>
                  </div>
                </div>

                {/* Calculate Button */}
                <Button 
                  onClick={calculateADE} 
                  disabled={loading || !isMethodDataValid()} 
                  className="w-full"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {loading ? 'Calculating...' : `Calculate ADE/PDE (${activeTab.toUpperCase()})`}
                </Button>

                {/* Results */}
                {result && (
                  <div className="p-4 bg-green-50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Calculation Result</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded">
                        <p className="text-sm text-gray-500">Calculated ADE/PDE</p>
                        <p className="text-2xl font-bold text-pharma-700">{result.calculated_ade_mg_per_day.toFixed(6)} mg/day</p>
                        <p className="text-xs text-gray-400">= {(result.calculated_ade_mg_per_day * 1000).toFixed(2)} µg/day</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <p className="text-sm text-gray-500">Calculation Method</p>
                        <p className="text-lg font-semibold text-pharma-600">{result.calculation_method}</p>
                      </div>
                    </div>
                    
                    <div className="p-2 bg-white rounded">
                      <p className="text-xs font-medium text-gray-700">Formula Breakdown:</p>
                      <p className="text-xs text-gray-600 mt-1">{result.calculation_details}</p>
                    </div>
                    
                    {result.route_adjustment && (
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-xs text-blue-700">{result.route_adjustment}</p>
                      </div>
                    )}
                    
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">{result.calculation_justification}</p>
                    </div>
                    
                    <div className="p-2 bg-blue-50 rounded text-center">
                      <p className="text-xs text-blue-800">
                        <strong>Reference:</strong> {result.reference}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reference Note */}
                <div className="p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium">Important Notes:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>ADE/PDE values should be calculated by qualified toxicologists</li>
                      <li>Default body weight: 50 kg (adult) per EMA/WHO guidelines</li>
                      <li>TTC approach (100 µg/day) used when no toxicology data is available</li>
                      <li>Parenteral products require 10x stricter limits than oral</li>
                      <li>Reference: EMA/CHMP/CVMP/SWP/169430/2012, APIC 2021 Section 4.2.1.1</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}