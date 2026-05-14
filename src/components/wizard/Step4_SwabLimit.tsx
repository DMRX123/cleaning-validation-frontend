'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Step4_SwabLimit({ data }: { data: any; onChange: (data: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Swab Limit Calculation</CardTitle>
      </CardHeader>
      <CardContent>
        {data.swabLimit ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">Swab Limit</p>
              <p className="text-2xl font-bold text-pharma-600">{data.swabLimit.mg_per_swab} mg/swab</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">Swab Limit</p>
              <p className="text-2xl font-bold text-pharma-600">{data.swabLimit.ppm} ppm</p>
            </div>
          </div>
        ) : (
          <div>Complete previous steps to calculate swab limit</div>
        )}
      </CardContent>
    </Card>
  )
}
