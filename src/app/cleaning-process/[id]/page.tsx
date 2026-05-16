'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Plus, Play, CheckCircle, Loader2 } from 'lucide-react'
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
      setProcess(res.data.process)
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
      setCapabilityResult(res.data)
    } catch (error) {
      toast.error('Failed to analyze capability')
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
      case 'LOW': return 'risk-low'
      case 'MEDIUM': return 'risk-medium'
      case 'HIGH': return 'risk-high'
      case 'CRITICAL': return 'risk-critical'
      default: return 'risk-default'
    }
  }

  const getCpkColorClass = (cpk: number) => {
    if (cpk >= 1.33) return 'capability-card-value-green'
    if (cpk >= 1) return 'capability-card-value-yellow'
    return 'capability-card-value-red'
  }

  const getProgressClass = () => {
    if (!capabilityResult || !capabilityResult.maco_limit_ppm) return 'capability-progress-width-0'
    const width = Math.min(100, (capabilityResult.mean_residue_ppm / capabilityResult.maco_limit_ppm) * 100)
    const rounded = Math.round(width / 10) * 10
    return `capability-progress-width-${rounded}`
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
            <div className="flex items-center gap-4 mb-6">
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
                              <TableCell>{exec.temperature_c || '-'}</TableCell>
                              <TableCell>{exec.flow_rate_lpm || '-'}</TableCell>
                              <TableCell>{exec.pressure_bar || '-'}</TableCell>
                              <TableCell>{exec.duration_min || '-'}</TableCell>
                              <TableCell>
                                <Badge variant={exec.all_parameters_acceptable ? 'success' : 'destructive'}>
                                  {exec.all_parameters_acceptable ? 'PASS' : 'FAIL'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="capability">
                <Card>
                  <CardHeader>
                    <CardTitle>Process Capability Analysis</CardTitle>
                    <p className="text-sm text-gray-500">Section 6.0 - Figure 2: Mean effectiveness vs spread vs MACO</p>
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
                        <div className="capability-grid">
                          <div className="capability-card">
                            <p className="capability-card-title">Mean Residue</p>
                            <p className="capability-card-value">{capabilityResult.mean_residue_ppm} ppm</p>
                          </div>
                          <div className="capability-card">
                            <p className="capability-card-title">Standard Deviation</p>
                            <p className="capability-card-value">±{capabilityResult.standard_deviation_ppm} ppm</p>
                          </div>
                          <div className="capability-card">
                            <p className="capability-card-title">Capability Index (Cpk)</p>
                            <p className={getCpkColorClass(capabilityResult.capability_index_cpk)}>
                              {capabilityResult.capability_index_cpk}
                            </p>
                          </div>
                          <div className="capability-card">
                            <p className="capability-card-title">Risk Level</p>
                            <Badge className={getRiskClass(capabilityResult.risk_level)}>
                              {capabilityResult.risk_level}
                            </Badge>
                          </div>
                        </div>

                        <div className="margin-card">
                          <p className="margin-title">Process Margin</p>
                          <div className="mt-2">
                            <div className="margin-labels">
                              <span>MACO Limit: {capabilityResult.maco_limit_ppm} ppm</span>
                              <span>Current Mean: {capabilityResult.mean_residue_ppm} ppm</span>
                            </div>
                            <div className="progress-bar-bg">
                              <div className={`progress-bar-fill ${getProgressClass()}`} />
                            </div>
                            <p className="margin-distance">
                              Distance from MACO: {capabilityResult.distance_from_maco_ppm} ppm ({capabilityResult.margin_percent}% margin)
                            </p>
                          </div>
                        </div>

                        <div className="recommendation-card">
                          <p className="recommendation-title">Recommendation</p>
                          <p className="recommendation-text">{capabilityResult.recommendation}</p>
                          <p className="recommendation-note">Based on {capabilityResult.data_points_used} execution records</p>
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