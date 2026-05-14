'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, CheckCircle, AlertCircle } from 'lucide-react'

interface MACOResultsProps {
  results: {
    method_10ppm: number
    method_tdd: number
    method_ade_pde: number
    method_ttc?: number
    lowest_maco: number
    purging_factor_used?: number
    safety_factor_used?: number
  } | null
  loading?: boolean
}

export function MACOResults({ results, loading }: MACOResultsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pharma-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!results) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            Select products and click "Calculate MACO" to see results
          </div>
        </CardContent>
      </Card>
    )
  }

  const methods = [
    { name: '10 ppm Method', value: results.method_10ppm, formula: '0.00001 × Min Batch Next (mg)' },
    { name: 'TDD Method', value: results.method_tdd, formula: '(TDD Prev × Min Batch Next) / (1000 × MDD Next)' },
    { name: 'ADE/PDE Method', value: results.method_ade_pde, formula: '(ADE × MBS × PF) / (MDD × SF)' },
  ]

  if (results.method_ttc) {
    methods.push({ name: 'TTC Method', value: results.method_ttc, formula: 'TTC value × MBS (mg)' })
  }

  const isLowest = (value: number) => value === results.lowest_maco

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          MACO Calculation Results
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            {methods.map((method) => (
              <TableRow key={method.name} className={isLowest(method.value) ? 'bg-pharma-50' : ''}>
                <TableCell className="font-medium">{method.name}</TableCell>
                <TableCell className="font-mono">{method.value.toFixed(2)}</TableCell>
                <TableCell className="text-sm text-gray-500">{method.formula}</TableCell>
                <TableCell>
                  {isLowest(method.value) ? (
                    <Badge variant="success" className="flex items-center gap-1 w-fit">
                      <CheckCircle className="h-3 w-3" />
                      Lowest MACO
                    </Badge>
                  ) : (
                    <Badge variant="outline">Alternative</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-pharma-100">
              <TableCell className="font-bold">Lowest MACO Selected</TableCell>
              <TableCell className="font-bold text-pharma-700 font-mono text-lg">
                {results.lowest_maco.toFixed(2)} mg
              </TableCell>
              <TableCell colSpan={2} className="text-sm">
                MIN of all methods
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {(results.purging_factor_used || results.safety_factor_used) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Factors Applied:</strong>
              {results.purging_factor_used && results.purging_factor_used !== 1 && (
                <span className="ml-2">PF = {results.purging_factor_used}</span>
              )}
              {results.safety_factor_used && results.safety_factor_used !== 1 && (
                <span className="ml-2">SF = {results.safety_factor_used}</span>
              )}
            </p>
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <p className="text-sm text-yellow-800">
            The lowest MACO value ({results.lowest_maco.toFixed(2)} mg) will be used for all subsequent 
            swab and rinse limit calculations.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}