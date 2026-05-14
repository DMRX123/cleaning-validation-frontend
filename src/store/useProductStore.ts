import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProductState {
  products: any[]
  selectedProduct: any | null
  loading: boolean
  setProducts: (products: any[]) => void
  setSelectedProduct: (product: any | null) => void
  setLoading: (loading: boolean) => void
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
    }),
    {
      name: 'product-storage',
    }
  )
)