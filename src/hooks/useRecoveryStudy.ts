// src/hooks/useRecoveryStudy.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { RecoveryStudy, RecoveryStudyCreate } from '@/types/api'

export function useRecoveryStudies(productId?: number) {
  const url = productId ? `/recovery-studies?product_id=${productId}` : '/recovery-studies'
  return useQuery({
    queryKey: ['recovery-studies', productId],
    queryFn: async () => {
      const res = await api.get(url)
      return res.data as RecoveryStudy[]
    },
  })
}

export function useCreateRecoveryStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: RecoveryStudyCreate) => {
      const res = await api.post('/recovery-studies', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recovery-studies'] })
      toast.success('Recovery study created')
    },
    onError: () => toast.error('Failed to create recovery study'),
  })
}