// src/hooks/useBracketing.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { BracketingGroup, BracketingGroupCreate } from '@/types/api'

export function useBracketingGroups() {
  return useQuery({
    queryKey: ['bracketing-groups'],
    queryFn: async () => {
      const res = await api.get('/bracketing-groups')
      return res.data as BracketingGroup[]
    },
  })
}

export function useCreateBracketingGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: BracketingGroupCreate) => {
      const res = await api.post('/bracketing-groups', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bracketing-groups'] })
      toast.success('Bracketing group created')
    },
    onError: () => toast.error('Failed to create bracketing group'),
  })
}

export function useCalculateBracketingMatrix() {
  return useMutation({
    mutationFn: async ({ equipmentType, productIds }: { equipmentType: string; productIds: number[] }) => {
      const res = await api.post('/bracketing/matrix', {
        equipment_type: equipmentType,
        product_ids: productIds,
      })
      return res.data
    },
  })
}