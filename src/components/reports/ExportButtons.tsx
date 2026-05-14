'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet, FileJson, FileCode, Printer, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface ExportButtonsProps {
  sessionId: number
  sessionCode: string
  onExport?: (format: string, success: boolean) => void
  showLabel?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

interface ExportStatus {
  format: string
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

export function ExportButtons({ 
  sessionId, 
  sessionCode, 
  onExport, 
  showLabel = true,
  variant = 'outline',
  size = 'default',
  className = ''
}: ExportButtonsProps) {
  const [exportStatus, setExportStatus] = useState<ExportStatus[]>([
    { format: 'pdf', status: 'idle' },
    { format: 'excel', status: 'idle' },
    { format: 'json', status: 'idle' },
    { format: 'csv', status: 'idle' },
  ])

  const getStatusForFormat = (format: string) => {
    return exportStatus.find(s => s.format === format) || { format, status: 'idle' }
  }

  const updateStatus = (format: string, status: 'idle' | 'loading' | 'success' | 'error', message?: string) => {
    setExportStatus(prev => prev.map(s => 
      s.format === format ? { ...s, status, message } : s
    ))
  }

  // Export as PDF
  const exportPDF = async () => {
    updateStatus('pdf', 'loading')
    try {
      const response = await api.get(`/reports/${sessionId}/pdf`, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `validation_report_${sessionCode}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      updateStatus('pdf', 'success')
      toast.success('PDF report downloaded successfully')
      onExport?.('pdf', true)
      
      // Reset status after 2 seconds
      setTimeout(() => updateStatus('pdf', 'idle'), 2000)
    } catch (error: any) {
      console.error('PDF export failed:', error)
      updateStatus('pdf', 'error', error.response?.data?.detail || 'Failed to generate PDF')
      toast.error('Failed to download PDF report')
      onExport?.('pdf', false)
      setTimeout(() => updateStatus('pdf', 'idle'), 3000)
    }
  }

  // Export as Excel
  const exportExcel = async () => {
    updateStatus('excel', 'loading')
    try {
      const response = await api.get(`/reports/${sessionId}/excel`, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `validation_data_${sessionCode}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      updateStatus('excel', 'success')
      toast.success('Excel data exported successfully')
      onExport?.('excel', true)
      setTimeout(() => updateStatus('excel', 'idle'), 2000)
    } catch (error: any) {
      console.error('Excel export failed:', error)
      updateStatus('excel', 'error', error.response?.data?.detail || 'Failed to export Excel')
      toast.error('Failed to export Excel data')
      onExport?.('excel', false)
      setTimeout(() => updateStatus('excel', 'idle'), 3000)
    }
  }

  // Export as JSON
  const exportJSON = async () => {
    updateStatus('json', 'loading')
    try {
      const response = await api.get(`/reports/${sessionId}/json`)
      const data = response.data
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `validation_data_${sessionCode}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      updateStatus('json', 'success')
      toast.success('JSON data exported successfully')
      onExport?.('json', true)
      setTimeout(() => updateStatus('json', 'idle'), 2000)
    } catch (error: any) {
      console.error('JSON export failed:', error)
      updateStatus('json', 'error', error.response?.data?.detail || 'Failed to export JSON')
      toast.error('Failed to export JSON data')
      onExport?.('json', false)
      setTimeout(() => updateStatus('json', 'idle'), 3000)
    }
  }

  // Export as CSV
  const exportCSV = async () => {
    updateStatus('csv', 'loading')
    try {
      // First get the data
      const response = await api.get(`/reports/${sessionId}/json`)
      const data = response.data
      
      // Convert to CSV
      let csvContent = ''
      
      // Swab Results CSV
      if (data.swab_results && data.swab_results.length > 0) {
        csvContent += 'Swab Results\n'
        csvContent += 'Location,Result (ppm),Status\n'
        data.swab_results.forEach((row: any) => {
          csvContent += `"${row.location_name}",${row.result_ppm || 0},"${row.reported || ''}"\n`
        })
        csvContent += '\n'
      }
      
      // Rinse Results CSV
      if (data.rinse_results && data.rinse_results.length > 0) {
        csvContent += 'Rinse Results\n'
        csvContent += 'Equipment,Rinse Volume (L),Result (ppm),Status\n'
        data.rinse_results.forEach((row: any) => {
          csvContent += `"${row.equipment_name}",${row.actual_rinse_volume || 0},${row.result_ppm || 0},"${row.reported || ''}"\n`
        })
        csvContent += '\n'
      }
      
      // MACO Results CSV
      if (data.lowest_maco) {
        csvContent += 'MACO Results\n'
        csvContent += `Lowest MACO (mg),${data.lowest_maco}\n`
        csvContent += `Swab Limit (ppm),${data.swab_limit_ppm || 0}\n`
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `validation_data_${sessionCode}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      updateStatus('csv', 'success')
      toast.success('CSV data exported successfully')
      onExport?.('csv', true)
      setTimeout(() => updateStatus('csv', 'idle'), 2000)
    } catch (error: any) {
      console.error('CSV export failed:', error)
      updateStatus('csv', 'error', error.response?.data?.detail || 'Failed to export CSV')
      toast.error('Failed to export CSV data')
      onExport?.('csv', false)
      setTimeout(() => updateStatus('csv', 'idle'), 3000)
    }
  }

  // Print report
  const printReport = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  const getStatusIcon = (format: string) => {
    const status = getStatusForFormat(format)
    switch (status.status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const renderButton = (format: string, icon: React.ReactNode, label: string, onClick: () => void) => {
    const status = getStatusForFormat(format)
    const isDisabled = status.status === 'loading'
    
    return (
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={isDisabled}
        className={`${className} ${status.status === 'success' ? 'border-green-500 text-green-600' : ''} ${status.status === 'error' ? 'border-red-500 text-red-600' : ''}`}
      >
        {status.status === 'loading' ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          icon
        )}
        {showLabel && label}
        {getStatusIcon(format)}
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* PDF Export Button */}
      {renderButton(
        'pdf',
        <FileText className="h-4 w-4 mr-2" />,
        'PDF Report',
        exportPDF
      )}

      {/* Excel Export Button */}
      {renderButton(
        'excel',
        <FileSpreadsheet className="h-4 w-4 mr-2" />,
        'Excel Data',
        exportExcel
      )}

      {/* Dropdown Menu for more formats */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size}>
            <Download className="h-4 w-4 mr-2" />
            {showLabel && 'More Formats'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={exportJSON} disabled={getStatusForFormat('json').status === 'loading'}>
            {getStatusForFormat('json').status === 'loading' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileJson className="h-4 w-4 mr-2" />
            )}
            JSON Format
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportCSV} disabled={getStatusForFormat('csv').status === 'loading'}>
            {getStatusForFormat('csv').status === 'loading' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileCode className="h-4 w-4 mr-2" />
            )}
            CSV Format
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={printReport}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}