'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Upload, Download, Search } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  min_batch_size: number
  max_batch_size: number
  ade_pde: number
  solubility: string
  hardest_to_clean: string
  plant: string
  swab_recovery: number
  loq: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data)
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`)
        toast.success('Product deleted')
        fetchProducts()
      } catch (error) {
        toast.error('Failed to delete product')
      }
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.plant.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-pharma-700">Products</h1>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  <Link href="/products/new">Add Product</Link>
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Database</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Batch Size (kg)</TableHead>
                        <TableHead>ADE/PDE (µg/day)</TableHead>
                        <TableHead>Solubility</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Plant</TableHead>
                        <TableHead>Recovery</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.min_batch_size} - {product.max_batch_size}</TableCell>
                          <TableCell>{product.ade_pde}</TableCell>
                          <TableCell>
                            <Badge variant={
                              product.solubility.includes('Very Soluble') ? 'success' :
                              product.solubility.includes('Insoluble') ? 'destructive' : 'default'
                            }>
                              {product.solubility}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.hardest_to_clean}</TableCell>
                          <TableCell>{product.plant}</TableCell>
                          <TableCell>{product.swab_recovery}%</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/products/${product.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}