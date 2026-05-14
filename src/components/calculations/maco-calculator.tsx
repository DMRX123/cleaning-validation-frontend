'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, TrendingDown, AlertCircle, CheckCircle, Info, Settings } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  min_batch_size: number
  max_batch_size: number
  ade_pde: number
  min_dose: number
  max_dose: number
  plant: string
}

interface MACOResult {
  method_10ppm: number
  method_tdd: number
  method_ade_pde: number
  method_ttc?: number
  lowest_maco: number
  purging_factor_used?: number
  safety_factor_used?: number
}

interface MACOCalculatorProps {
  onCalculate?: (result: MACOResult) => void
  initialPreviousProductId?: number
  initialNextProductId?: number
}

export function MACOCalculator({ onCalculate, initialPreviousProductId, initialNextProductId }: MACOCalculatorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [previousProductId, setPreviousProductId] = useState<string>(initialPreviousProductId?.toString() || '')
  const [nextProductId, setNextProductId] = useState<string>(initialNextProductId?.toString() || '')
  const [purgingFactor, setPurgingFactor] = useState<number>(1)
  const [safetyFactor, setSafetyFactor] = useState<number>(1)
  const [productionType, setProductionType] = useState<string>('api_chemical')
  const [result, setResult] = useState<MACOResult | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string>('all')

  // Fetch products on mount
  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const calculateMACO = async () => {
    if (!previousProductId || !nextProductId) {
      toast.error('Please select both products')
      return
    }

    setCalculating(true)
    try {
      const response = await api.post('/calculations/maco', {
        previous_product_id: parseInt(previousProductId),
        next_product_id: parseInt(nextProductId),
      })
      setResult(response.data)
      if (onCalculate) {
        onCalculate(response.data)
      }
      toast.success('MACO calculated successfully')
    } catch (error) {
      toast.error('Failed to calculate MACO')
    } finally {
      setCalculating(false)
    }
  }

  const calculateAdvancedMACO = async () => {
    if (!previousProductId || !nextProductId) {
      toast.error('Please select both products')
      return
    }

    setCalculating(true)
    try {
      const response = await api.post('/cleaning-validation/maco-advanced', {
        previous_product_id: parseInt(previousProductId),
        next_product_id: parseInt(nextProductId),
        purging_factor: purgingFactor,
        safety_factor: safetyFactor,
        production_type: productionType,
      })
      setResult(response.data)
      if (onCalculate) {
        onCalculate(response.data)
      }
      toast.success('Advanced MACO calculated with PF/SF')
    } catch (error) {
      toast.error('Failed to calculate advanced MACO')
    } finally {
      setCalculating(false)
    }
  }

  const getSelectedProduct = (id: string): Product | undefined => {
    return products.find(p => p.id.toString() === id)
  }

  const previousProduct = getSelectedProduct(previousProductId)
  const nextProd = getSelectedProduct(nextProductId)

  const isLowest = (value: number) => result && value === result.lowest_maco

  const getMethodStatus = (value: number) => {
    if (!result) return 'pending'
    if (value === result.lowest_maco) return 'selected'
    return 'alternative'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selected':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Lowest MACO</Badge>
      case 'alternative':
        return <Badge variant="outline">Alternative</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-pharma-600" />
          MACO Calculator
          <span className="text-sm font-normal text-gray-500 ml-2">(APIC Section 4.2.1 - 4.2.3)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" onValueChange={setSelectedMethod}>
          <TabsList className="mb-6">
            <TabsTrigger value="basic">Basic MACO</TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings className="h-3 w-3 mr-1" />
              Advanced (PF/SF)
            </TabsTrigger>
            <TabsTrigger value="info">
              <Info className="h-3 w-3 mr-1" />
              About Methods
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            {/* Product Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-semibold">Previous Product (to be cleaned out)</Label>
                <Select
                  value={previousProductId}
                  onChange={(e) => setPreviousProductId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select previous product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.plant}) - ADE: {product.ade_pde} µg/day
                    </option>
                  ))}
                </Select>
                {previousProduct && (
                  <div className="text-xs text-gray-500 mt-1">
                    Batch: {previousProduct.min_batch_size} - {previousProduct.max_batch_size} kg | 
                    Dose: {previousProduct.min_dose} - {previousProduct.max_dose} mg | 
                    ADE/PDE: {previousProduct.ade_pde} µg/day
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Next Product (to be manufactured)</Label>
                <Select
                  value={nextProductId}
                  onChange={(e) => setNextProductId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select next product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.plant}) - ADE: {product.ade_pde} µg/day
                    </option>
                  ))}
                </Select>
                {nextProd && (
                  <div className="text-xs text-gray-500 mt-1">
                    Batch: {nextProd.min_batch_size} - {nextProd.max_batch_size} kg | 
                    Dose: {nextProd.min_dose} - {nextProd.max_dose} mg
                  </div>
                )}
              </div>
            </div>

            {/* Calculate Button */}
            <Button 
              onClick={calculateMACO} 
              disabled={calculating || !previousProductId || !nextProductId}
              className="w-full bg-pharma-600 hover:bg-pharma-700"
            >
              {calculating ? 'Calculating...' : 'Calculate MACO'}
            </Button>

            {/* Results */}
            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">MACO Calculation Results</h3>
                    <Badge variant="default" className="bg-pharma-600">
                      Lowest: {result.lowest_maco.toFixed(2)} mg
                    </Badge>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Method</TableHead>
                        <TableHead>Value (mg)</TableHead>
                        <TableHead>Formula</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className={isLowest(result.method_10ppm) ? 'bg-pharma-50' : ''}>
                        <TableCell className="font-medium">10 ppm Method</TableCell>
                        <TableCell className="font-mono">{result.method_10ppm.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-gray-500">0.00001 × Min Batch Size (mg)</TableCell>
                        <TableCell>{getStatusBadge(getMethodStatus(result.method_10ppm))}</TableCell>
                      </TableRow>
                      <TableRow className={isLowest(result.method_tdd) ? 'bg-pharma-50' : ''}>
                        <TableCell className="font-medium">TDD Method</TableCell>
                        <TableCell className="font-mono">{result.method_tdd.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-gray-500">(TDDprev × MBS) / (1000 × MDDnext)</TableCell>
                        <TableCell>{getStatusBadge(getMethodStatus(result.method_tdd))}</TableCell>
                      </TableRow>
                      <TableRow className={isLowest(result.method_ade_pde) ? 'bg-pharma-50' : ''}>
                        <TableCell className="font-medium">ADE/PDE Method</TableCell>
                        <TableCell className="font-mono">{result.method_ade_pde.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-gray-500">(ADE × MBS) / MDDnext</TableCell>
                        <TableCell>{getStatusBadge(getMethodStatus(result.method_ade_pde))}</TableCell>
                      </TableRow>
                      {result.method_ttc && (
                        <TableRow className={isLowest(result.method_ttc) ? 'bg-pharma-50' : ''}>
                          <TableCell className="font-medium">TTC Method</TableCell>
                          <TableCell className="font-mono">{result.method_ttc.toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-gray-500">TTC value × MBS</TableCell>
                          <TableCell>{getStatusBadge(getMethodStatus(result.method_ttc))}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Selected MACO: {result.lowest_maco.toFixed(2)} mg</p>
                      <p className="text-xs mt-1">This value will be used for swab and rinse limit calculations</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {/* Product Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-semibold">Previous Product</Label>
                <Select
                  value={previousProductId}
                  onChange={(e) => setPreviousProductId(e.target.value)}
                >
                  <option value="">Select previous product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Next Product</Label>
                <Select
                  value={nextProductId}
                  onChange={(e) => setNextProductId(e.target.value)}
                >
                  <option value="">Select next product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Advanced Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Purging Factor (PF)
                  <span className="text-xs text-gray-400">(APIC Section 4.2.1)</span>
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={purgingFactor}
                  onChange={(e) => setPurgingFactor(parseFloat(e.target.value))}
                  placeholder="Default: 1"
                />
                <p className="text-xs text-gray-500">Reflects ability to reduce contaminant in downstream steps</p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Safety Factor (SF)
                  <span className="text-xs text-gray-400">(APIC Section 4.2.1)</span>
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={safetyFactor}
                  onChange={(e) => setSafetyFactor(parseFloat(e.target.value))}
                  placeholder="Default: 1"
                />
                <p className="text-xs text-gray-500">Risk from interaction between products</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Production Type</Label>
              <Select value={productionType} onChange={(e) => setProductionType(e.target.value)}>
                <option value="pharmaceutical">Pharmaceutical Production</option>
                <option value="api_chemical">API Chemical Production</option>
                <option value="api_physical">API Physical Operations (Drying/Milling)</option>
                <option value="intermediate_early">Intermediate - Early Step</option>
                <option value="intermediate_late">Intermediate - Late Step</option>
              </Select>
              <p className="text-xs text-gray-500">APIC Section 4.2.6 - Different limits for different production types</p>
            </div>

            <Button 
              onClick={calculateAdvancedMACO} 
              disabled={calculating || !previousProductId || !nextProductId}
              className="w-full bg-pharma-600 hover:bg-pharma-700"
            >
              {calculating ? 'Calculating...' : 'Calculate Advanced MACO'}
            </Button>

            {result && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-5 w-5 text-pharma-600" />
                  <h3 className="font-semibold">Advanced MACO Result</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded">
                    <p className="text-sm text-gray-500">Lowest MACO</p>
                    <p className="text-2xl font-bold text-pharma-700">{result.lowest_maco.toFixed(2)} mg</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <p className="text-sm text-gray-500">PF × SF Applied</p>
                    <p className="text-lg font-mono">{purgingFactor} × {safetyFactor} = {(purgingFactor * safetyFactor).toFixed(2)}</p>
                  </div>
                </div>
                {result.purging_factor_used && (
                  <div className="mt-3 text-xs text-gray-500">
                    PF Applied: {result.purging_factor_used} | SF Applied: {result.safety_factor_used}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">10 ppm Method</h4>
                <p className="text-sm text-blue-700 mt-1">General limit when toxicity data not available</p>
                <div className="mt-2 p-2 bg-white rounded font-mono text-xs">
                  MACO = 0.00001 × Min Batch Size (mg)
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">TDD Method (1/1000th dose)</h4>
                <p className="text-sm text-green-700 mt-1">For therapeutic macromolecules & peptides</p>
                <div className="mt-2 p-2 bg-white rounded font-mono text-xs">
                  MACO = (TDDprev × MBS) / (1000 × MDDnext)
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800">ADE/PDE Method</h4>
                <p className="text-sm text-purple-700 mt-1">Health-based exposure limits</p>
                <div className="mt-2 p-2 bg-white rounded font-mono text-xs">
                  MACO = (ADE × MBS × PF) / (MDD × SF)
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800">TTC Method</h4>
                <p className="text-sm text-yellow-700 mt-1">Threshold of Toxicological Concern</p>
                <div className="mt-2 p-2 bg-white rounded font-mono text-xs">
                  Carcinogenic: 1 µg/day | Potent: 10 µg/day | Standard: 100 µg/day
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
              <p className="font-medium mb-1">Reference:</p>
              <p>APIC Cleaning Validation Guide - Section 4.2.1 to 4.2.3</p>
              <p>EMA/CHMP/CVMP/SWP/169430/2012 - Guideline on setting health-based exposure limits</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

