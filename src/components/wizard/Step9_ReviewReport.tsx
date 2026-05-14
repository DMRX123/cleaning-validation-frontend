'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function Step9_ReviewReport({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader><CardTitle>Step 9: Review & Report</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded"><span className="text-gray-500">Lowest MACO:</span><br/><span className="font-bold">{data.maco?.lowest_maco || 'N/A'} mg</span></div>
            <div className="p-3 bg-gray-50 rounded"><span className="text-gray-500">Swab Limit:</span><br/><span className="font-bold">{data.swabLimit?.ppm || 'N/A'} ppm</span></div>
          </div>
          {data.sessionId && (
            <Button onClick={() => router.push(`/reports/${data.sessionId}`)} className="w-full">Generate Report</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

