'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function ProductImport() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      toast.success('Import completed')
    } catch (error) {
      toast.error('Import failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Products from Excel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">Upload Excel file with product data</p>
          <p className="text-sm text-gray-400 mb-4">
            Format should match the original "Input Details" sheet
          </p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" asChild>
              <span>Select File</span>
            </Button>
          </label>
          {file && (
            <p className="mt-2 text-sm text-green-600">Selected: {file.name}</p>
          )}
        </div>

        <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload and Import'}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg ${result.imported > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex items-start gap-3">
              {result.imported > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              )}
              <div>
                <p className="font-medium">Import Summary</p>
                <p className="text-sm">Imported: {result.imported} products</p>
                <p className="text-sm">Skipped: {result.skipped} products</p>
                {result.errors && result.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-sm text-red-600 cursor-pointer">View Errors</summary>
                    <ul className="mt-2 text-sm text-red-500 list-disc list-inside">
                      {result.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        <Button variant="outline" onClick={() => router.push('/products')} className="w-full">
          Back to Products
        </Button>
      </CardContent>
    </Card>
  )
}