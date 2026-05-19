// src/app/(dashboard)/import/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductImport } from '@/components/products/product-import'
import { EquipmentImport } from '@/components/equipment/equipment-import'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Upload, Package, Settings } from 'lucide-react'

export default function ImportPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumb />
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="h-8 w-8 text-pharma-600" />
              <h1 className="text-2xl font-bold text-pharma-700">Import Data</h1>
            </div>

            <Tabs defaultValue="products">
              <TabsList className="mb-6">
                <TabsTrigger value="products">
                  <Package className="h-4 w-4 mr-2" />
                  Import Products
                </TabsTrigger>
                <TabsTrigger value="equipment">
                  <Settings className="h-4 w-4 mr-2" />
                  Import Equipment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <ProductImport />
              </TabsContent>

              <TabsContent value="equipment">
                <EquipmentImport />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}