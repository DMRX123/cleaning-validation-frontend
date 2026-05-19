// src/components/calculations/MACOTrendChart.tsx
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
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, Loader2 } from 'lucide-react'
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
      const response = await api.get('/validation/history')
      const sessions = response.data.sessions || response.data || []
      
      const trendData: MACOTrendData[] = sessions
        .filter((s: any) => s.lowest_maco !== null && s.lowest_maco > 0)
        .map((s: any) => ({
          id: s.id,
          session_code: s.session_code,
          date: new Date(s.created_at).toISOString().split('T')[0],
          previous_product: s.previous_product?.name || s.previous_product_name || 'Unknown',
          next_product: s.next_product?.name || s.next_product_name || 'Unknown',
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
      setData(getMockData())
    } finally {
      setLoading(false)
    }
  }

  const getMockData = (): MACOTrendData[] => {
    const mockSessions = []
    const startDate = new Date('2024-01-01')
    const products = ['Product A', 'Product B', 'Product C', 'Product D']
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate)
      date.setMonth(startDate.getMonth() + i)
      
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

  const getFilteredData = () => {
    let filtered = [...data]
    
    if (timeRange !== 'all') {
      const monthsMap = { '3months': 3, '6months': 6, '1year': 12 }
      const months = monthsMap[timeRange]
      const cutoffDate = new Date()
      cutoffDate.setMonth(cutoffDate.getMonth() - months)
      filtered = filtered.filter(item => new Date(item.date) >= cutoffDate)
    }
    
    if (productFilter) {
      filtered = filtered.filter(item => 
        item.previous_product === productFilter || item.next_product === productFilter
      )
    }
    
    return filtered.map(item => ({
      date: item.date,
      maco_value: item[selectedMetric],
      session_code: item.session_code,
      previous_product: item.previous_product,
      next_product: item.next_product
    }))
  }

  const getUniqueProducts = () => {
    const products = new Set<string>()
    data.forEach(item => {
      products.add(item.previous_product)
      products.add(item.next_product)
    })
    return Array.from(products).sort()
  }

  const getStatistics = () => {
    const filteredData = getFilteredData()
    if (filteredData.length === 0) return null
    
    const values = filteredData.map(d => d.maco_value)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    const sorted = [...values].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const trend = values.length > 1 ? values[values.length - 1] - values[0] : 0
    
    return { avg, max, min, median, trend, count: values.length }
  }

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
              <XAxis dataKey="date" stroke="#6b7280" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" label={{ value: 'MACO (mg)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="maco_value" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', strokeWidth: 2 }} activeDot={{ r: 6 }} name="MACO Value" />
              <ReferenceLine y={50} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Alert Limit', position: 'right' }} />
              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Action Limit', position: 'right' }} />
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
              <ReferenceLine y={50} stroke="#eab308" strokeDasharray="3 3" />
              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" />
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
            <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
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
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="time-range" className="text-xs">Time Range</Label>
            <select 
              id="time-range"
              className="w-full p-2 border rounded-md text-sm"
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as any)}
              aria-label="Time Range"
              title="Time Range"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="product-filter" className="text-xs">Product</Label>
            <select 
              id="product-filter"
              className="w-full p-2 border rounded-md text-sm"
              value={productFilter} 
              onChange={(e) => setProductFilter(e.target.value)}
              aria-label="Filter by Product"
              title="Filter by Product"
            >
              <option value="">All Products</option>
              {uniqueProducts.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="metric-select" className="text-xs">Metric</Label>
            <select 
              id="metric-select"
              className="w-full p-2 border rounded-md text-sm"
              value={selectedMetric} 
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              aria-label="Select Metric"
              title="Select Metric"
            >
              <option value="lowest_maco">Lowest MACO</option>
              <option value="method_10ppm">10 ppm Method</option>
              <option value="method_tdd">TDD Method</option>
              <option value="method_ade_pde">ADE/PDE Method</option>
            </select>
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant={chartType === 'line' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setChartType('line')}
              className={chartType === 'line' ? 'bg-pharma-600' : ''}
              aria-label="Line Chart View"
              title="Line Chart View"
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant={chartType === 'bar' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setChartType('bar')}
              className={chartType === 'bar' ? 'bg-pharma-600' : ''}
              aria-label="Bar Chart View"
              title="Bar Chart View"
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
        
        {/* Reference Note */}
        <div className="p-2 bg-gray-50 rounded text-xs text-gray-500 text-center">
          Reference: APIC Cleaning Validation Guide Section 4.2.1 - 4.2.3
        </div>
      </CardContent>
    </Card>
  )
}