'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { EquipmentForm } from '@/components/equipment/equipment-form'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import api from '@/lib/api'

export default function EditEquipmentPage() {
  const params = useParams()
  const equipmentId = params.id as string
  const [equipment, setEquipment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get(`/equipment/${equipmentId}`)
        setEquipment(res.data)
      } catch (error) {
        console.error('Failed to fetch equipment:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEquipment()
  }, [equipmentId])

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
          <EquipmentForm initialData={equipment} isEditing />
        </main>
      </div>
    </div>
  )
}