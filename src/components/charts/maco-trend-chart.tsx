'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Calendar, Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface MACOTrendData {
  id: number
  session_code: string
  date: string
  previous_product: string
  next_product: string
  method_10ppm: number
  method_tdd: number
  method_ade_pde: number
  lowest_maco: number
  status: string
}

interface ChartDataPoint {
  date: string
  maco_value: number
  method_10ppm?: number
  method_tdd?: number
  method_ade_pde?: number
  session_code: string
  previous_product: string
  next_product: string
}

interface ProductSummary {
  product_name: string
  count: number
  avg_maco: number
  max_maco: number
  min_maco: number
}

const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

interface MACOTrendChartProps {
  sessionId?: number
  height?: number
  showExport?: boolean
}

export function MACOTrendChart({ sessionId, height = 400, showExport = true }: MACOTrendChartProps) {
  const [data, setData] = useState<MACOTrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line')
  const [timeRange, setTimeRange] = useState<'3months' | '6months' | '1year' | 'all'>('6months')
  const [selectedMetric, setSelectedMetric] = useState<'lowest_maco' | 'method_10ppm' | 'method_tdd' | 'method_ade_pde'>('lowest_maco')
  const [productFilter, setProductFilter] = useState<string>('')

  useEffect(() => {
    fetchMACOHistory()
  }, [])

  const fetchMACOHistory = async () => {
    setLoading(true)
    try {
      // Fetch validation sessions with MACO data
      const response = await api.get('/validation/history')
      const sessions = response.data
      
      // Transform data for chart
      const trendData: MACOTrendData[] = sessions
        .filter((s: any) => s.lowest_maco !== null && s.lowest_maco > 0)
        .map((s: any) => ({
          id: s.id,
          session_code: s.session_code,
          date: new Date(s.created_at).toISOString().split('T')[0],
          previous_product: s.previous_product?.name || 'Unknown',
          next_product: s.next_product?.name || 'Unknown',
          method_10ppm: s.maco_10ppm || 0,
          method_tdd: s.maco_tdd || 0,
          method_ade_pde: s.maco_ade_pde || 0,
          lowest_maco: s.lowest_maco || 0,
          status: s.status
        }))
        .sort((a: MACOTrendData, b: MACOTrendData) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      setData(trendData)
    } catch (error) {
      console.error('Failed to fetch MACO history:', error)
      toast.error('Failed to load MACO trend data')
      // Fallback mock data for demo
      setData(getMockData())
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demo when API is not available
  const getMockData = (): MACOTrendData[] => {
    const mockSessions = []
    const startDate = new Date('2024-01-01')
    const products = ['Ciprofloxacin', 'Paracetamol', 'Clarithromycin', 'Lansoprazole', 'Entacavir']
    
    for (let i = 0; i < 20; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i * 14)
      
      mockSessions.push({
        id: i + 1,
        session_code: `VAL-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        date: date.toISOString().split('T')[0],
        previous_product: products[i % products.length],
        next_product: products[(i + 1) % products.length],
        method_10ppm: Math.random() * 500 + 100,
        method_tdd: Math.random() * 300 + 50,
        method_ade_pde: Math.random() * 150 + 10,
        lowest_maco: Math.random() * 100 + 5,
        status: Math.random() > 0.2 ? 'COMPLETED' : 'APPROVED'
      })
    }
    return mockSessions
  }

  // Filter data by time range
  const getFilteredData = (): ChartDataPoint[] => {
    let filtered = [...data]
    
    // Apply time range filter
    if (timeRange !== 'all') {
      const monthsMap = { '3months': 3, '6months': 6, '1year': 12 }
      const months = monthsMap[timeRange]
      const cutoffDate = new Date()
      cutoffDate.setMonth(cutoffDate.getMonth() - months)
      filtered = filtered.filter(item => new Date(item.date) >= cutoffDate)
    }
    
    // Apply product filter
    if (productFilter) {
      filtered = filtered.filter(item => 
        item.previous_product === productFilter || item.next_product === productFilter
      )
    }
    
    return filtered.map(item => ({
      date: item.date,
      maco_value: item[selectedMetric],
      method_10ppm: item.method_10ppm,
      method_tdd: item.method_tdd,
      method_ade_pde: item.method_ade_pde,
      session_code: item.session_code,
      previous_product: item.previous_product,
      next_product: item.next_product
    }))
  }

  // Get unique products for filter
  const getUniqueProducts = (): string[] => {
    const products = new Set<string>()
    data.forEach(item => {
      products.add(item.previous_product)
      products.add(item.next_product)
    })
    return Array.from(products).sort()
  }

  // Get product summary
  const getProductSummary = (): ProductSummary[] => {
    const summaryMap = new Map<string, { count: number; total_maco: number; max_maco: number; min_maco: number }>()
    
    data.forEach(item => {
      const product = item.previous_product
      const current = summaryMap.get(product) || { count: 0, total_maco: 0, max_maco: -Infinity, min_maco: Infinity }
      
      summaryMap.set(product, {
        count: current.count + 1,
        total_maco: current.total_maco + item.lowest_maco,
        max_maco: Math.max(current.max_maco, item.lowest_maco),
        min_maco: Math.min(current.min_maco, item.lowest_maco)
      })
    })
    
    return Array.from(summaryMap.entries()).map(([product, stats]) => ({
      product_name: product,
      count: stats.count,
      avg_maco: stats.total_maco / stats.count,
      max_maco: stats.max_maco,
      min_maco: stats.min_maco === Infinity ? 0 : stats.min_maco
    }))
  }

  // Get statistical summary
  const getStatistics = () => {
    const filteredData = getFilteredData()
    if (filteredData.length === 0) return null
    
    const values = filteredData.map(d => d.maco_value)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    const sorted = [...values].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const trend = values[values.length - 1] - values[0]
    
    return { avg, max, min, median, trend, count: values.length }
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-pharma-600">MACO: {payload[0].value?.toFixed(2)} mg</p>
          <p className="text-xs text-gray-500 mt-1">
            {dataPoint.previous_product} → {dataPoint.next_product}
          </p>
          <p className="text-xs text-gray-400 mt-1">{dataPoint.session_code}</p>
        </div>
      )
    }
    return null
  }

  const chartData = getFilteredData()
  const statistics = getStatistics()
  const productSummary = getProductSummary()
  const uniqueProducts = getUniqueProducts()

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <BarChart3 className="h-12 w-12 mb-2" />
          <p>No data available for selected filters</p>
        </div>
      )
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="#6b7280" 
                label={{ value: 'MACO (mg)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="maco_value" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                name="MACO Value"
              />
              <ReferenceLine y={50} stroke="#eab308" strokeDasharray="3 3" label="Alert Limit" />
              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label="Action Limit" />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" label={{ value: 'MACO (mg)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="maco_value" fill="#22c55e" radius={[4, 4, 0, 0]} name="MACO Value" />
              <ReferenceLine y={50} stroke="#eab308" strokeDasharray="3 3" label="Alert Limit" />
              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label="Action Limit" />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="maco_value" fill="#22c55e" fillOpacity={0.3} stroke="#22c55e" strokeWidth={2} name="MACO Value" />
              <Line type="monotone" dataKey="maco_value" stroke="#166534" strokeWidth={1.5} dot={false} />
              <ReferenceLine y={50} stroke="#eab308" strokeDasharray="3 3" />
              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        )
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pharma-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-pharma-600" />
            MACO Trend Analysis
          </CardTitle>
          
          {showExport && chartData.length > 0 && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <Label className="text-xs">Time Range</Label>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="all">All Time</option>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <Label className="text-xs">Product</Label>
            <Select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
              <option value="">All Products</option>
              {uniqueProducts.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <Label className="text-xs">Metric</Label>
            <Select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value as any)}>
              <option value="lowest_maco">Lowest MACO</option>
              <option value="method_10ppm">10 ppm Method</option>
              <option value="method_tdd">TDD Method</option>
              <option value="method_ade_pde">ADE/PDE Method</option>
            </Select>
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant={chartType === 'line' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setChartType('line')}
              className={chartType === 'line' ? 'bg-pharma-600' : ''}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant={chartType === 'bar' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setChartType('bar')}
              className={chartType === 'bar' ? 'bg-pharma-600' : ''}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Chart */}
        {renderChart()}
        
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <p className="text-xs text-green-600">Average MACO</p>
              <p className="text-xl font-bold text-green-700">{statistics.avg.toFixed(2)} mg</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-xs text-blue-600">Maximum MACO</p>
              <p className="text-xl font-bold text-blue-700">{statistics.max.toFixed(2)} mg</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg text-center">
              <p className="text-xs text-yellow-600">Minimum MACO</p>
              <p className="text-xl font-bold text-yellow-700">{statistics.min.toFixed(2)} mg</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <p className="text-xs text-purple-600">Median MACO</p>
              <p className="text-xl font-bold text-purple-700">{statistics.median.toFixed(2)} mg</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-600">Total Sessions</p>
              <p className="text-xl font-bold text-gray-700">{statistics.count}</p>
            </div>
          </div>
        )}
        
        {/* Trend Indicator */}
        {statistics && statistics.trend !== 0 && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${statistics.trend > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            {statistics.trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-600" />
            )}
            <p className={`text-sm ${statistics.trend > 0 ? 'text-red-700' : 'text-green-700'}`}>
              MACO is {statistics.trend > 0 ? 'increasing' : 'decreasing'} by {Math.abs(statistics.trend).toFixed(2)} mg over the selected period
            </p>
          </div>
        )}
        
        {/* Product Summary Table */}
        {productSummary.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2 text-sm">Product-wise MACO Summary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-right py-2">Sessions</th>
                    <th className="text-right py-2">Avg MACO (mg)</th>
                    <th className="text-right py-2">Max MACO (mg)</th>
                    <th className="text-right py-2">Min MACO (mg)</th>
                  </tr>
                </thead>
                <tbody>
                  {productSummary.slice(0, 10).map((product, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2">{product.product_name}</td>
                      <td className="text-right py-2">{product.count}</td>
                      <td className="text-right py-2">{product.avg_maco.toFixed(2)}</td>
                      <td className="text-right py-2">{product.max_maco.toFixed(2)}</td>
                      <td className="text-right py-2">{product.min_maco.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Reference Note */}
        <div className="p-2 bg-gray-50 rounded text-xs text-gray-500 text-center">
          Reference: APIC Cleaning Validation Guide Section 4.2.1 - 4.2.3
        </div>
      </CardContent>
    </Card>
  )
}