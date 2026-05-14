import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'

export interface MACOResult {
  method_10ppm: number
  method_tdd: number
  method_ade_pde: number
  lowest_maco: number
}

export function useCalculateMACO() {
  return useMutation({
    mutationFn: async ({ previousProductId, nextProductId }: { previousProductId: number; nextProductId: number }) => {
      const res = await api.post('/calculations/maco', {
        previous_product_id: previousProductId,
        next_product_id: nextProductId,
      })
      return res.data as MACOResult
    },
  })
}