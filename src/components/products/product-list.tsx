'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react'
import Link from 'next/link'
import { useProducts, useDeleteProduct } from '@/hooks/use-products'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function ProductList() {
  const router = useRouter()
  const { data: products, isLoading } = useProducts()
  const deleteProduct = useDeleteProduct()
  const [search, setSearch] = useState('')

  const filteredProducts = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.plant.toLowerCase().includes(search.toLowerCase())
  ) || []

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Products</CardTitle>
          <div className="flex gap-2">
            <Link href="/products/import">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </Link>
            <Link href="/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Batch Size (kg)</TableHead>
              <TableHead>ADE/PDE</TableHead>
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
                <TableCell>{product.ade_pde} µg/day</TableCell>
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
      </CardContent>
    </Card>
  )
}