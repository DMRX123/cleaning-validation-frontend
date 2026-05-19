// src/store/useProductStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Product {
  id: number
  name: string
  min_batch_size: number
  max_batch_size: number
  ade_pde: number
  solubility: string
  hardest_to_clean: string
  plant: string
}

interface ProductState {
  products: Product[]
  selectedProduct: Product | null
  loading: boolean
  setProducts: (products: Product[]) => void
  setSelectedProduct: (product: Product | null) => void
  setLoading: (loading: boolean) => void
  addProduct: (product: Product) => void
  updateProduct: (id: number, product: Partial<Product>) => void
  removeProduct: (id: number) => void
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: [],
      selectedProduct: null,
      loading: false,
      setProducts: (products) => set({ products }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setLoading: (loading) => set({ loading }),
      addProduct: (product) => set((state) => ({ 
        products: [...state.products, product] 
      })),
      updateProduct: (id, product) => set((state) => ({
        products: state.products.map((p) => 
          p.id === id ? { ...p, ...product } : p
        )
      })),
      removeProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),
    }),
    {
      name: 'product-storage',
    }
  )
)