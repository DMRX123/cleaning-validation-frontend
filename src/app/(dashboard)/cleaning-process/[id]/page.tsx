// src/app/(dashboard)/cleaning-process/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Plus, Play, CheckCircle, Loader2, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import toast from 'react-hot-toast'

export default function CleaningProcessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const processId = params.id as string
  const [process, setProcess] = useState<any>(null)
  const [parameters, setParameters] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [capabilityResult, setCapabilityResult] = useState<any>(null)
  const [capabilityLoading, setCapabilityLoading] = useState(false)

  useEffect(() => {
    fetchProcessData()
  }, [processId])

  const fetchProcessData = async () => {
    try {
      const res = await api.get(`/cleaning-process/${processId}`)
      setProcess(res.data.process || res.data)
      setParameters(res.data.parameters || [])
      setExecutions(res.data.recent_executions || [])
    } catch (error) {
      toast.error('Failed to load process data')
    } finally {
      setLoading(false)
    }
  }

  const analyzeCapability = async () => {
    setCapabilityLoading(true)
    try {
      const res = await api.post('/cleaning-process/capability', {
        process_id: parseInt(processId),
        historical_executions_count: 10
      })
      setCapabilityResult(res.data.data || res.data)
      toast.success('Capability analysis completed')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to analyze capability')
    } finally {
      setCapabilityLoading(false)
    }
  }

  const handleValidate = async () => {
    try {
      await api.post(`/cleaning-process/${processId}/validate`, {
        validation_protocol_id: 1
      })
      toast.success('Process marked as validated')
      fetchProcessData()
    } catch (error) {
      toast.error('Failed to validate process')
    }
  }

  const getRiskClass = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
      </div>
    )
  }

  if (!process) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Process not found</p>
          <Button onClick={() => router.push('/cleaning-process')} className="mt-4">
            Back to Processes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href="/cleaning-process">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-pharma-700">{process.name}</h1>
                <Badge variant={process.is_validated ? 'success' : 'warning'}>
                  {process.is_validated ? 'Validated' : 'Not Validated'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Link href={`/cleaning-process/${processId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="executions">Executions</TabsTrigger>
                <TabsTrigger value="capability">Capability Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Process Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Process Code</p>
                        <p className="font-mono">{process.process_code}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Cleaning Type</p>
                        <p className="font-medium">{process.cleaning_type?.replace('_', ' ').toUpperCase()}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">SOP Reference</p>
                        <p>{process.sop_reference || 'Not specified'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Created By</p>
                        <p>{process.created_by || 'System'}</p>
                      </div>
                    </div>
                    {process.description && (
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="text-sm mt-1">{process.description}</p>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <Link href={`/cleaning-process/${processId}/execute`}>
                        <Button>
                          <Play className="h-4 w-4 mr-2" />
                          Record Execution
                        </Button>
                      </Link>
                      {!process.is_validated && (
                        <Button variant="outline" onClick={handleValidate}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Validated
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="parameters">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Critical Parameters</span>
                      <Link href={`/cleaning-process/${processId}/parameters/new`}>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Parameter
                        </Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {parameters.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No parameters defined. Add critical parameters to control the cleaning process.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Parameter</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Min Acceptable</TableHead>
                              <TableHead>Target</TableHead>
                              <TableHead>Max Acceptable</TableHead>
                              <TableHead>Critical</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parameters.map((param) => (
                              <TableRow key={param.id}>
                                <TableCell className="font-medium">{param.parameter_name}</TableCell>
                                <TableCell>{param.parameter_unit}</TableCell>
                                <TableCell>{param.min_acceptable}</TableCell>
                                <TableCell>{param.target_value || '-'}</TableCell>
                                <TableCell>{param.max_acceptable}</TableCell>
                                <TableCell>
                                  <Badge variant={param.is_critical ? 'destructive' : 'secondary'}>
                                    {param.is_critical ? 'Critical' : 'Standard'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="executions">
                <Card>
                  <CardHeader>
                    <CardTitle>Execution History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {executions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No executions recorded yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Executed By</TableHead>
                              <TableHead>Temperature (°C)</TableHead>
                              <TableHead>Flow Rate (L/min)</TableHead>
                              <TableHead>Pressure (bar)</TableHead>
                              <TableHead>Duration (min)</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {executions.map((exec) => (
                              <TableRow key={exec.id}>
                                <TableCell>{new Date(exec.execution_date).toLocaleString()}</TableCell>
                                <TableCell>{exec.executed_by}</TableCell>
                                <TableCell>{exec.actual_temperature_c || '-'}</TableCell>
                                <TableCell>{exec.actual_flow_rate_lpm || '-'}</TableCell>
                                <TableCell>{exec.actual_pressure_bar || '-'}</TableCell>
                                <TableCell>{exec.actual_duration_min || '-'}</TableCell>
                                <TableCell>
                                  <Badge variant={exec.all_parameters_acceptable ? 'success' : 'destructive'}>
                                    {exec.all_parameters_acceptable ? 'PASS' : 'FAIL'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="capability">
                <Card>
                  <CardHeader>
                    <CardTitle>Process Capability Analysis</CardTitle>
                    <p className="text-sm text-gray-500">Section 6.0 - Mean effectiveness vs spread vs MACO</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!capabilityResult && !capabilityLoading && (
                      <div className="text-center py-8">
                        <Button onClick={analyzeCapability}>
                          Analyze Process Capability
                        </Button>
                      </div>
                    )}

                    {capabilityLoading && (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-pharma-600" />
                      </div>
                    )}

                    {capabilityResult && !capabilityResult.error && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-xs text-gray-500">Mean Residue</p>
                            <p className="text-xl font-bold text-pharma-700">{capabilityResult.mean_residue_ppm} ppm</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-xs text-gray-500">Standard Deviation</p>
                            <p className="text-xl font-bold text-pharma-700">±{capabilityResult.standard_deviation_ppm} ppm</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-xs text-gray-500">Capability Index (Cpk)</p>
                            <p className={`text-xl font-bold ${
                              capabilityResult.capability_index_cpk >= 1.33 ? 'text-green-600' :
                              capabilityResult.capability_index_cpk >= 1 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {capabilityResult.capability_index_cpk}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-xs text-gray-500">Risk Level</p>
                            <Badge className={getRiskClass(capabilityResult.risk_level)}>
                              {capabilityResult.risk_level}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="font-medium text-blue-800">Process Margin</p>
                          <div className="mt-2">
                            <div className="flex justify-between text-sm">
                              <span>MACO Limit: {capabilityResult.maco_limit_ppm} ppm</span>
                              <span>Current Mean: {capabilityResult.mean_residue_ppm} ppm</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-pharma-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (capabilityResult.mean_residue_ppm / capabilityResult.maco_limit_ppm) * 100)}%` }}
                              />
                            </div>
                            <p className="text-sm text-blue-700 mt-2">
                              Distance from MACO: {capabilityResult.distance_from_maco_ppm} ppm ({capabilityResult.margin_percent}% margin)
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-800">Recommendation</p>
                          <p className="text-sm text-green-700 mt-1">{capabilityResult.recommendation}</p>
                          <p className="text-xs text-green-600 mt-1">Based on {capabilityResult.data_points_used} execution records</p>
                        </div>
                      </>
                    )}

                    {capabilityResult?.error && (
                      <div className="text-center py-8 text-gray-500">
                        {capabilityResult.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}