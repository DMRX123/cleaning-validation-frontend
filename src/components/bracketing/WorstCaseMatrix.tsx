'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy, AlertCircle } from 'lucide-react'
import api from '@/lib/api'

interface WorstCaseMatrixProps {
  productIds: number[]
}

export function WorstCaseMatrix({ productIds }: WorstCaseMatrixProps) {
  const [matrix, setMatrix] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (productIds.length > 0) {
      generateMatrix()
    }
  }, [productIds])

  const generateMatrix = async () => {
    setLoading(true)
    try {
      const res = await api.post('/cleaning-validation/bracketing-matrix', {
        equipment_type: 'reactor',
        product_ids: productIds
      })
      setMatrix(res.data)
    } catch (error) {
      console.error('Failed to generate matrix:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRatingBadge = (rating: number) => {
    if (rating >= 12) return <Badge variant="destructive">Very High</Badge>
    if (rating >= 8) return <Badge variant="warning">High</Badge>
    if (rating >= 5) return <Badge variant="default">Medium</Badge>
    return <Badge variant="success">Low</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Worst Case Rating Matrix (Section 7.5)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Generating bracketing matrix...</div>
        ) : matrix?.bracketing_matrix ? (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Substance</TableHead>
                  <TableHead>Cleaning Class</TableHead>
                  <TableHead className="text-center">Hardest to Clean</TableHead>
                  <TableHead className="text-center">Solubility</TableHead>
                  <TableHead className="text-center">ADE/PDE</TableHead>
                  <TableHead className="text-center">Dose</TableHead>
                  <TableHead className="text-center">Total Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrix.bracketing_matrix.map((item: any, idx: number) => (
                  <TableRow key={idx} className={idx === 0 ? 'bg-yellow-50' : ''}>
                    <TableCell className="font-medium">
                      {item.Substance}
                      {idx === 0 && (
                        <Badge variant="default" className="ml-2">WORST CASE</Badge>
                      )}
                    </TableCell>
                    <TableCell>{item["Cleaning Method Class"]}</TableCell>
                    <TableCell className="text-center">{item["a) Hardest to clean"]}</TableCell>
                    <TableCell className="text-center">{item["b) Solubility"]}</TableCell>
                    <TableCell className="text-center">{item["c) ADE/PDE"]}</TableCell>
                    <TableCell className="text-center">{item["d) Therapeutic dose"]}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold">{item["Total Rating"]}</span>
                        {getRatingBadge(item["Total Rating"])}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Validation Recommendation</p>
                  <p className="text-sm text-green-700">{matrix.validation_recommendation}</p>
                  <p className="text-sm text-green-600 mt-1">
                    Total products in bracket: {matrix.total_products_in_bracket}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Select products to generate bracketing matrix
          </div>
        )}

        <Button onClick={generateMatrix} disabled={loading} className="mt-4 w-full">
          Generate/Refresh Matrix
        </Button>
      </CardContent>
    </Card>
  )
}