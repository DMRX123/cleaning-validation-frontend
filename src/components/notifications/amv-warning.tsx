// src/components/notifications/amv-warning.tsx
'use client'

import { AlertTriangle, XCircle, CheckCircle, Info } from 'lucide-react'

interface AMVWarningProps {
  warnings: Array<{
    field: string
    display_name: string
    value: any
    advice: string
    severity: 'high' | 'medium' | 'low'
  }>
  onDismiss?: () => void
}

export function AMVWarning({ warnings, onDismiss }: AMVWarningProps) {
  if (warnings.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-green-800">All AMV details are complete</p>
          <p className="text-sm text-green-700">Analytical Method Validation details are properly filled.</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="ml-auto text-green-600 hover:text-green-800">
            ×
          </button>
        )}
      </div>
    )
  }

  const highSeverity = warnings.filter(w => w.severity === 'high')
  const mediumSeverity = warnings.filter(w => w.severity === 'medium')

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-yellow-800">
            AMV Details Missing or Incomplete
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Please update the following Analytical Method Validation details:
          </p>
          
          <div className="mt-3 space-y-2">
            {highSeverity.map((warning, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <span className="text-red-700">
                  <strong>{warning.display_name}:</strong> {warning.advice}
                </span>
              </div>
            ))}
            {mediumSeverity.map((warning, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <Info className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span className="text-yellow-700">
                  <strong>{warning.display_name}:</strong> {warning.advice}
                </span>
              </div>
            ))}
          </div>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-yellow-600 hover:text-yellow-800">
            ×
          </button>
        )}
      </div>
    </div>
  )
}