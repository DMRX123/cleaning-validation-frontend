// src/components/dynamic-pdf/DynamicProtocolReport.tsx
'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download, FileText, Eye, Printer, Edit, Save, X } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface EditableSection {
  id: string
  title: string
  defaultContent: string
  currentContent: string
  isEditing: boolean
}

interface DynamicProtocolReportProps {
  type: 'protocol' | 'report'
  id: number
  title: string
  subtitle?: string
  data: any
  onGenerate?: () => void
}

export function DynamicProtocolReport({ type, id, title, subtitle, data, onGenerate }: DynamicProtocolReportProps) {
  const [loading, setLoading] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [sections, setSections] = useState<EditableSection[]>([
    {
      id: 'introduction',
      title: '1. Introduction',
      defaultContent: data?.introduction || '',
      currentContent: data?.introduction || '',
      isEditing: false,
    },
    {
      id: 'objective',
      title: '2. Objective',
      defaultContent: data?.objective || '',
      currentContent: data?.objective || '',
      isEditing: false,
    },
    {
      id: 'scope',
      title: '3. Scope',
      defaultContent: data?.scope || '',
      currentContent: data?.scope || '',
      isEditing: false,
    },
    {
      id: 'responsibilities',
      title: '4. Responsibilities',
      defaultContent: data?.responsibilities || '',
      currentContent: data?.responsibilities || '',
      isEditing: false,
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      defaultContent: data?.conclusion || '',
      currentContent: data?.conclusion || '',
      isEditing: false,
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      defaultContent: data?.recommendations || '',
      currentContent: data?.recommendations || '',
      isEditing: false,
    },
  ])

  const handleSectionEdit = (sectionId: string, newContent: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, currentContent: newContent } : s
    ))
  }

  const toggleEditMode = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, isEditing: !s.isEditing } : s
    ))
  }

  const resetSection = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, currentContent: s.defaultContent, isEditing: false } : s
    ))
    toast.success(`${sections.find(s => s.id === sectionId)?.title} reset to default`)
  }

  const saveAllSections = async () => {
    const updatedData: Record<string, string> = {}
    sections.forEach(s => {
      updatedData[s.id] = s.currentContent
    })
    
    try {
      await api.put(`/${type}s/${id}/content`, updatedData)
      toast.success('All sections saved successfully')
      setSections(sections.map(s => ({ ...s, defaultContent: s.currentContent, isEditing: false })))
    } catch (error) {
      toast.error('Failed to save sections')
    }
  }

  const handleDownload = async () => {
    setLoading(true)
    try {
      const endpoint = type === 'protocol' 
        ? `/protocol/generate/${id}` 
        : `/report/generate/${id}`
      
      const response = await api.post(endpoint, {
        sections: sections.reduce((acc, s) => ({ ...acc, [s.id]: s.currentContent }), {}),
      }, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}_${id}_${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success(`${type === 'protocol' ? 'Protocol' : 'Report'} downloaded successfully`)
      if (onGenerate) onGenerate()
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to generate document')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Render printable content
  const renderPrintableContent = () => (
    <div className="print-content" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-pharma-700">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        <p className="text-sm text-gray-400 mt-2">Generated on: {new Date().toLocaleString()}</p>
      </div>

      {/* Product Information */}
      {data?.product && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Product Information</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium w-1/3">Product Name</td>
                <td className="py-2">{data.product.name}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Product Code</td>
                <td className="py-2">{data.product.product_code || 'N/A'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Batch Size Range</td>
                <td className="py-2">{data.product.batch_size_range || `${data.product.min_batch_size} - ${data.product.max_batch_size} kg`}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Plant</td>
                <td className="py-2">{data.product.plant}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* MACO Results */}
      {data?.maco && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">MACO Calculation Results</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Method</th>
                <th className="p-2 text-right">Value (mg)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">10 ppm Method</td>
                <td className="p-2 text-right">{data.maco.method_10ppm?.toFixed(2) || 0}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">TDD Method</td>
                <td className="p-2 text-right">{data.maco.method_tdd?.toFixed(2) || 0}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">ADE/PDE Method</td>
                <td className="p-2 text-right">{data.maco.method_ade_pde?.toFixed(2) || 0}</td>
              </tr>
              <tr className="bg-pharma-50">
                <td className="p-2 font-bold">Lowest MACO (Selected)</td>
                <td className="p-2 text-right font-bold">{data.maco.lowest_maco?.toFixed(2) || 0} mg</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Swab Results */}
      {data?.swab_results && data.swab_results.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Swab Results</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Location</th>
                <th className="p-2 text-right">Result (ppm)</th>
                <th className="p-2 text-right">Limit (ppm)</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.swab_results.map((result: any, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{result.location_name}</td>
                  <td className="p-2 text-right">{result.result_ppm?.toFixed(2) || 'Below LOQ'}</td>
                  <td className="p-2 text-right">{data.swab_limit_ppm?.toFixed(2) || 0}</td>
                  <td className="p-2 text-center">
                    {result.result_ppm && data.swab_limit_ppm && result.result_ppm <= data.swab_limit_ppm ? '✓ PASS' : '✓ Below LOQ'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rinse Results */}
      {data?.rinse_results && data.rinse_results.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Rinse Results</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Equipment</th>
                <th className="p-2 text-right">Result (ppm)</th>
                <th className="p-2 text-right">Limit (ppm)</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.rinse_results.map((result: any, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{result.equipment_name}</td>
                  <td className="p-2 text-right">{result.result_ppm?.toFixed(2) || 'Below LOQ'}</td>
                  <td className="p-2 text-right">{data.rinse_limit_ppm?.toFixed(2) || 0}</td>
                  <td className="p-2 text-center">
                    {result.result_ppm && data.rinse_limit_ppm && result.result_ppm <= data.rinse_limit_ppm ? '✓ PASS' : '✓ Below LOQ'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editable Sections */}
      {sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
          <div className="whitespace-pre-wrap text-gray-700">
            {section.currentContent || 'Not specified'}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="border-t pt-4 mt-6 text-center text-sm text-gray-500">
        <p>This is a system-generated document. For verification, please contact Quality Assurance.</p>
        <p className="mt-2">_________________________</p>
        <p>Authorized Signatory</p>
      </div>
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-pharma-600" />
              {title}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowEditor(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Content
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownload} disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : `Download ${type === 'protocol' ? 'Protocol' : 'Report'}`}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-auto border rounded-lg p-4 bg-white">
            {renderPrintableContent()}
          </div>
        </CardContent>
      </Card>

      {/* Content Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Document Content</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue={sections[0].id}>
            <TabsList className="flex flex-wrap h-auto">
              {sections.map((section) => (
                <TabsTrigger key={section.id} value={section.id}>
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {sections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="space-y-4">
                <div className="space-y-2">
                  <Label>{section.title}</Label>
                  <Textarea
                    rows={10}
                    value={section.currentContent}
                    onChange={(e) => handleSectionEdit(section.id, e.target.value)}
                    placeholder={`Enter ${section.title.toLowerCase()} content...`}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => toggleEditMode(section.id)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => resetSection(section.id)}>
                    Reset to Default
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button onClick={saveAllSections}>
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}