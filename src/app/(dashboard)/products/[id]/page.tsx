'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ProductForm } from '@/components/products/product-form'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import api from '@/lib/api'

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${productId}`)
        setProduct(res.data)
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

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
          <ProductForm initialData={product} isEditing />
        </main>
      </div>
    </div>
  )
}