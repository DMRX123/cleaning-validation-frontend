// src/app/(dashboard)/change-control/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChangeControlForm } from '@/components/change-control/ChangeControlForm'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function EditChangeControlPage() {
  const params = useParams()
  const router = useRouter()
  const changeId = params.id as string
  const [change, setChange] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChange = async () => {
      try {
        const res = await api.get(`/change-control/${changeId}`)
        setChange(res.data)
      } catch (error) {
        console.error('Failed to fetch change request:', error)
        toast.error('Failed to load change request')
        router.push('/change-control')
      } finally {
        setLoading(false)
      }
    }
    fetchChange()
  }, [changeId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
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
          <ChangeControlForm initialData={change} isEditing />
        </main>
      </div>
    </div>
  )
}