'use client'

import { EquipmentList } from '@/components/equipment/equipment-list'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'

export default function EquipmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <EquipmentList />
        </main>
      </div>
    </div>
  )
}