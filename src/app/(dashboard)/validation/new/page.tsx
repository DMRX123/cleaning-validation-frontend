'use client'

import { ValidationWizard } from '@/components/wizard/validation-wizard'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'

export default function NewValidationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <ValidationWizard />
        </main>
      </div>
    </div>
  )
}