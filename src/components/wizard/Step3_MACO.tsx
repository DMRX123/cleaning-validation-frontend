'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

export function Step3_MACO({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [loading, setLoading] = useState(false)

  const calculateMACO = async () => {
    if (!data.previousProductId || !data.nextProductId) return
    setLoading(true)
    try {
      const res = await api.post('/calculations/maco', {
        previous_product_id: data.previousProductId,
        next_product_id: data.nextProductId,
      })
      onChange({ ...data, maco: res.data })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (data.previousProductId && data.nextProductId && !data.maco) {
      calculateMACO()
    }
  }, [data.previousProductId, data.nextProductId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: MACO Calculation</CardTitle>
      </CardHeader>
      <CardContent>
        {data.maco ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Value (mg)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>10 ppm Method</TableCell><TableCell>{data.maco.method_10ppm}</TableCell></TableRow>
                <TableRow><TableCell>TDD Method</TableCell><TableCell>{data.maco.method_tdd}</TableCell></TableRow>
                <TableRow><TableCell>ADE/PDE Method</TableCell><TableCell>{data.maco.method_ade_pde}</TableCell></TableRow>
                <TableRow className="bg-pharma-50"><TableCell className="font-bold">Lowest MACO</TableCell><TableCell className="font-bold">{data.maco.lowest_maco} mg</TableCell></TableRow>
              </TableBody>
            </Table>
            <Button onClick={calculateMACO} className="mt-4">Recalculate</Button>
          </>
        ) : (
          <div>Click Next to calculate MACO</div>
        )}
      </CardContent>
    </Card>
  )
}
