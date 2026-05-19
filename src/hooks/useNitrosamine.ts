// src/hooks/useNitrosamine.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { NitrosamineRiskAssessment, NitrosamineCreate } from '@/types/api'

export function useNitrosamineAssessment(productId: number) {
  return useQuery({
    queryKey: ['nitrosamine', productId],
    queryFn: async () => {
      const res = await api.get(`/nitrosamine/${productId}`)
      return res.data as NitrosamineRiskAssessment | null
    },
    enabled: !!productId,
  })
}

export function useCreateNitrosamineAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: NitrosamineCreate) => {
      const res = await api.post('/nitrosamine', data)
      return res.data
    },
    onSuccess: (_, { product_id }) => {
      queryClient.invalidateQueries({ queryKey: ['nitrosamine', product_id] })
      toast.success('Nitrosamine risk assessment completed')
    },
    onError: () => toast.error('Failed to create assessment'),
  })
}