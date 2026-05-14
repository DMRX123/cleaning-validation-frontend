'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Step5_RinseLimit({ data }: { data: any; onChange: (data: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Rinse Limit Calculation</CardTitle>
      </CardHeader>
      <CardContent>
        {data.rinseLimit ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Rinse Limit</p>
            <p className="text-2xl font-bold text-pharma-600">{data.rinseLimit.limit_mg} mg</p>
          </div>
        ) : (
          <div>Complete previous steps to calculate rinse limit</div>
        )}
      </CardContent>
    </Card>
  )
}
