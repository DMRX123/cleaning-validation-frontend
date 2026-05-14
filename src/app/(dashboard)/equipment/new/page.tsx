'use client'

import { EquipmentForm } from '@/components/equipment/equipment-form'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'

export default function NewEquipmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <EquipmentForm />
        </main>
      </div>
    </div>
  )
}