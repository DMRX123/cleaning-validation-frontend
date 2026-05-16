'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, AlertCircle, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import toast from 'react-hot-toast'

export default function ADECalculatorPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
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
    modifying_factor: 1,
    pk_adjustment: 1,
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
      const res = await api.post('/cleaning-validation/calculate-ade', {
        product_id: parseInt(formData.product_id),
        noael_mg_per_kg: formData.noael_mg_per_kg ? parseFloat(formData.noael_mg_per_kg) : null,
        loael_mg_per_kg: formData.loael_mg_per_kg ? parseFloat(formData.loael_mg_per_kg) : null,
        ld50_mg_per_kg: formData.ld50_mg_per_kg ? parseFloat(formData.ld50_mg_per_kg) : null,
        body_weight_kg: formData.body_weight_kg,
        uf1: formData.uf1,
        uf2: formData.uf2,
        uf3: formData.uf3,
        uf4: formData.uf4,
        uf5: formData.uf5,
        modifying_factor: formData.modifying_factor,
        pk_adjustment: formData.pk_adjustment,
        route: formData.route
      })
      setResult(res.data)
      toast.success('ADE/PDE calculated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to calculate ADE')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, product_id: e.target.value })
  }

  const handleRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, route: e.target.value })
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
                <div className="space-y-2">
                  <Label htmlFor="product-select">Select Product *</Label>
                  <select
                    id="product-select"
                    name="product_id"
                    title="Select Product"
                    aria-label="Select Product for ADE/PDE calculation"
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                    value={formData.product_id}
                    onChange={handleSelectChange}
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (Current ADE: {p.ade_pde} µg/day)</option>
                    ))}
                  </select>
                </div>

                <Tabs defaultValue="noael">
                  <TabsList className="mb-4">
                    <TabsTrigger value="noael">NOAEL Method</TabsTrigger>
                    <TabsTrigger value="loael">LOAEL Method</TabsTrigger>
                    <TabsTrigger value="ld50">LD50 Method</TabsTrigger>
                    <TabsTrigger value="ttc">TTC Method</TabsTrigger>
                  </TabsList>

                  <TabsContent value="noael" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="noael">NOAEL (mg/kg/day)</Label>
                        <Input
                          id="noael"
                          type="number"
                          step="0.1"
                          value={formData.noael_mg_per_kg}
                          onChange={(e) => setFormData({ ...formData, noael_mg_per_kg: e.target.value })}
                          placeholder="e.g., 100"
                        />
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
                        <p className="text-xs text-gray-500">Standard: 50 kg per EMA guideline</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="loael" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="loael">LOAEL (mg/kg/day)</Label>
                        <Input
                          id="loael"
                          type="number"
                          step="0.1"
                          value={formData.loael_mg_per_kg}
                          onChange={(e) => setFormData({ ...formData, loael_mg_per_kg: e.target.value })}
                          placeholder="e.g., 50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="body-weight-loael">Body Weight (kg)</Label>
                        <Input
                          id="body-weight-loael"
                          type="number"
                          step="1"
                          value={formData.body_weight_kg}
                          onChange={(e) => setFormData({ ...formData, body_weight_kg: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ld50" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ld50">LD50 (mg/kg)</Label>
                        <Input
                          id="ld50"
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

                  <TabsContent value="ttc" className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">TTC values will be used automatically when no toxicology data is available</p>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-white rounded">
                          <strong>Carcinogenic</strong>
                          <p>1 µg/day</p>
                        </div>
                        <div className="p-2 bg-white rounded">
                          <strong>Potent</strong>
                          <p>10 µg/day</p>
                        </div>
                        <div className="p-2 bg-white rounded">
                          <strong>Standard</strong>
                          <p>100 µg/day</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Uncertainty Factors</h3>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="uf1">UF1</Label>
                      <Input id="uf1" type="number" step="1" value={formData.uf1} onChange={(e) => setFormData({ ...formData, uf1: parseFloat(e.target.value) })} />
                      <p className="text-xs text-gray-400">Interspecies</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="uf2">UF2</Label>
                      <Input id="uf2" type="number" step="1" value={formData.uf2} onChange={(e) => setFormData({ ...formData, uf2: parseFloat(e.target.value) })} />
                      <p className="text-xs text-gray-400">Interindividual</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="uf3">UF3</Label>
                      <Input id="uf3" type="number" step="1" value={formData.uf3} onChange={(e) => setFormData({ ...formData, uf3: parseFloat(e.target.value) })} />
                      <p className="text-xs text-gray-400">Subchronic to chronic</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="uf4">UF4</Label>
                      <Input id="uf4" type="number" step="1" value={formData.uf4} onChange={(e) => setFormData({ ...formData, uf4: parseFloat(e.target.value) })} />
                      <p className="text-xs text-gray-400">Severity</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="uf5">UF5</Label>
                      <Input id="uf5" type="number" step="1" value={formData.uf5} onChange={(e) => setFormData({ ...formData, uf5: parseFloat(e.target.value) })} />
                      <p className="text-xs text-gray-400">Database completeness</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="route-select">Route of Administration</Label>
                    <select
                      id="route-select"
                      name="route"
                      title="Route of Administration"
                      aria-label="Select Route of Administration"
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                      value={formData.route}
                      onChange={handleRouteChange}
                    >
                      <option value="oral">Oral</option>
                      <option value="parenteral">Parenteral</option>
                      <option value="topical">Topical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pk-adjustment">PK Adjustment</Label>
                    <Input
                      id="pk-adjustment"
                      type="number"
                      step="0.1"
                      value={formData.pk_adjustment}
                      onChange={(e) => setFormData({ ...formData, pk_adjustment: parseFloat(e.target.value) })}
                      placeholder="Default: 1"
                    />
                  </div>
                </div>

                <Button onClick={calculateADE} disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate ADE/PDE'}
                </Button>

                {result && (
                  <div className="p-4 bg-green-50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Calculation Result</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded">
                        <p className="text-sm text-gray-500">Calculated ADE/PDE</p>
                        <p className="text-2xl font-bold text-pharma-700">{result.calculated_ade_mg_per_day} mg/day</p>
                        <p className="text-xs text-gray-400">= {(result.calculated_ade_mg_per_day * 1000).toFixed(2)} µg/day</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <p className="text-sm text-gray-500">Calculation Method</p>
                        <p className="text-lg font-semibold text-pharma-600">{result.calculation_method}</p>
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">{result.calculation_justification}</p>
                    </div>
                    {result.is_approved && (
                      <div className="p-2 bg-green-100 rounded text-center">
                        <p className="text-xs text-green-800">✓ This ADE value is approved for use in MACO calculations</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> ADE/PDE values should be calculated by qualified toxicologists. 
                    The TTC approach (100 µg/day) is used when no toxicology data is available.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}