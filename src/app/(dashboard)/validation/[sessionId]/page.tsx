'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ValidationWizard } from '@/components/wizard/validation-wizard'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import api from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'

export default function EditValidationPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/validation/session/${sessionId}`)
        setSessionData(res.data)
      } catch (error) {
        console.error('Failed to fetch session:', error)
        toast.error('Failed to load validation session')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Session not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <ValidationWizard sessionId={sessionId} initialData={sessionData} />
        </main>
      </div>
    </div>
  )
}